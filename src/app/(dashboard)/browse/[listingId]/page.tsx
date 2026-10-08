import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";
import ListingGallery from "./ListingGallery";
import RentalRequestForm from "./RentalRequestForm";
import ReviewsSection from "./ReviewsSection";

type Listing = {
    id: string;
    owner_id: string;
    owner_name: string | null;
    owner_image: string | null;
    category_id: string | null;
    category_name: string | null;
    title: string;
    description: string;
    price_per_day: number | string;
    status: string;
    latitude: number | null;
    longitude: number | null;
    city: string | null;
    state: string | null;
    country: string | null;
    created_at: string;
    primary_image: string | null;
};

type ListingImage = {
    id: string;
    listing_id: string;
    image_url: string;
    display_order: number;
};

type ListingDetailsPageProps = {
    params: Promise<{
        listingId: string;
    }>;
}

export default async function ListingDetailsPage({
    params,
}: ListingDetailsPageProps) {
    const { listingId } = await params;
    const supabase = await createClient();

    const [
        listingResult,
        imagesResult,
        userResult,
    ] = await Promise.all([
        supabase
            .from("available_listings")
            .select("*")
            .eq("id", listingId)
            .maybeSingle(),
        
        supabase
            .from("public_listing_images")
            .select("id, listing_id, image_url, display_order")
            .eq("listing_id", listingId)
            .order("display_order", {
                ascending: true,
            }),
        
        supabase.auth.getUser(),
    ]);

    if (listingResult.error) {
        console.error(
            "There is an error on listing details:",
            listingResult.error
        );

        notFound();
    }

    if (!listingResult.data) {
        notFound();
    }

    if (imagesResult.error) {
        console.error(
            "There is an error on listing images:",
            imagesResult.error
        );
    }

    const listing = listingResult.data as Listing;
    const images = (imagesResult.data ?? []) as ListingImage[];
    const user = userResult.data.user;
    const isOwner = user?.id === listing.owner_id;
    const price = Number(listing.price_per_day);
    const location = [
        listing.city,
        listing.state,
        listing.country,
    ]
        .filter(Boolean)
        .join(", ");
    
    const createdDate = new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(new Date(listing.created_at));

    const ownerInitial = listing.owner_name?.charAt(0).toUpperCase() ?? "U";

    const { data: listingReviews } =
        await supabase
            .from("public_listing_reviews")
            .select(
            "id, reviewer_name, reviewer_image, rating, comment, created_at"
            )
            .eq("listing_id", listing.id)
            .order("created_at", {
            ascending: false,
            })
            .limit(50);

        const reviews =
        listingReviews ?? [];

        const averageRating =
        reviews.length > 0
            ? reviews.reduce(
                (sum, review) =>
                sum + Number(review.rating),
                0
            ) / reviews.length
            : 0;
    
        let eligibleRentalId:
            | string
            | null = null;

        if (user) {
            
            const { data: completedRentals } =
                await supabase
                .from("rentals")
                .select("id")
                .eq(
                    "listing_id",
                    listing.id
                )
                .eq(
                    "status",
                    "completed"
                )
                .or(
                    `owner_id.eq.${user.id},borrower_id.eq.${user.id}`
                )
                .order("end_date", {
                    ascending: false,
                });

            const rentalIds =
                (completedRentals ?? []).map(
                (rental) => rental.id
                );
            
            console.log("Review debug", {
                userId: user.id,
                listingId: listing.id,
                completedRentals,
            });

            if (rentalIds.length > 0) {
                const { data: existingReviews } =
                await supabase
                    .from("reviews")
                    .select("rental_id")
                    .eq(
                    "reviewer_id",
                    user.id
                    )
                    .eq(
                    "target_type",
                    "listing"
                    )
                    .in(
                    "rental_id",
                    rentalIds
                    );

                const reviewedIds =
                new Set(
                    (existingReviews ?? []).map(
                    (review) =>
                        review.rental_id
                    )
                );

                eligibleRentalId =
                rentalIds.find(
                    (id) =>
                    !reviewedIds.has(id)
                ) ?? null;
            }
        }

    return (
        <main className="min-h-screen bg-slate-50">
            <div className="mx-auto w-full max-w-[1700px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                <div className="mb-6">
                <Link
                    href="/browse"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
                >
                    <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    >
                    <path d="m15 18-6-6 6-6" />
                    </svg>
                    Back to browse
                </Link>
                </div>
                <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_380px] xl:gap-10">
                <section className="min-w-0">
                    <ListingGallery
                    title={listing.title}
                    primaryImage={listing.primary_image}
                    images={images}
                    />
                    <div className="mt-8">
                    <div className="flex flex-wrap items-center gap-2">
                        {listing.category_name && (
                        <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                            {listing.category_name}
                        </span>
                        )}
                        <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                        Available
                        </span>
                    </div>
                    <h1 className="mt-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                        {listing.title}
                    </h1>
                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
                        {location && (
                        <div className="flex items-center gap-1.5">
                            <svg
                            width="17"
                            height="17"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            >
                            <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
                            <circle cx="12" cy="10" r="2.5" />
                            </svg>
                            <span>{location}</span>
                        </div>
                        )}
                        <span>Listed {createdDate}</span>
                    </div>
                    </div>
                    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                    <h2 className="text-xl font-bold text-slate-900">
                        Equipment information
                    </h2>
                    <div className="mt-5">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                        Description
                        </h3>
                        <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600 sm:text-base">
                        {listing.description}
                        </p>
                    </div>
                    </section>
                    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                    <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                        <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
                            <circle cx="12" cy="10" r="2.5" />
                        </svg>
                        </div>
                        <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            Location
                        </h2>
                        <p className="mt-2 text-sm text-slate-600">
                            {location || "Location not provided"}
                        </p>
                        <p className="mt-2 text-xs leading-5 text-slate-400">
                            The location shown is approximate. Exact household
                            addresses are not stored as part of a public listing.
                        </p>
                        </div>
                    </div>
                    </section>
                    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                        <h2 className="text-xl font-bold text-slate-900">
                            Owner
                        </h2>
                        <div className="mt-5 flex items-center gap-4">
                            {listing.owner_image ? (
                            <img
                                src={listing.owner_image}
                                alt=""
                                className="h-14 w-14 rounded-full object-cover ring-4 ring-slate-100"
                            />
                            ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                                {ownerInitial}
                            </div>
                            )}
                            <div className="min-w-0">
                            <p className="truncate text-base font-bold text-slate-900">
                                {listing.owner_name || "GearSphere user"}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                                Equipment owner
                            </p>
                            </div>
                        </div>
                    </section>
                    <ReviewsSection
                        listingId={listing.id}
                        reviews={reviews}
                        averageRating={averageRating}
                        authenticated={Boolean(user)}
                        eligibleRentalId={eligibleRentalId}
                        />
                </section>
                <aside className="min-w-0">
                    <div className="lg:sticky lg:top-6">
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                        <div className="border-b border-slate-100 p-6 sm:p-7">
                        <p className="text-sm font-medium text-slate-500">
                            Rental price
                        </p>
                        <div className="mt-2 flex items-end gap-1">
                            <span className="text-4xl font-bold tracking-tight text-slate-900">
                            ${price.toFixed(2)}
                            </span>
                            <span className="pb-1 text-sm text-slate-500">
                            / day
                            </span>
                        </div>
                        </div>
                        <div className="p-6 sm:p-7">
                        <RentalRequestForm
                            listingId={listing.id}
                            pricePerDay={price}
                            authenticated={Boolean(user)}
                            isOwner={isOwner}
                        />
                        </div>
                    </div>
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex gap-3">
                        <div className="mt-0.5 shrink-0 text-slate-400">
                            <svg
                            width="19"
                            height="19"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            >
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 8v4l2.5 1.5" />
                            </svg>
                        </div>
                        <p className="text-xs leading-5 text-slate-500">
                            Your request is sent to the owner for approval.
                            The rental is not confirmed until the owner
                            approves the request.
                        </p>
                        </div>
                    </div>
                    </div>
                </aside>
                </div>
            </div>
            </main>
    );
}