export const defaultHotelDetails = {
    id: null,
    name: "",
    address: "",
    district: "",
    description: "",
    hotelLink: "",
    ratingStars: 0,
    facilities: [],
    highlights: {},
    reviews: {},
    imageUrls: [],
    roomServices: {},
    slug: "",
    longitude: 0,
    latitude: 0,
    roomTypes: [
        {
            id: null,
            hotelId: null,
            name: "",
            numberOfGuests: 0,
            price: 0,
            originalPrice: 0,
            taxesAndFeesUnderPrice: false,
        },
    ],
}

export const defaultRoomDetails = {
    id: null,
    hotelId: null,
    name: "",
    numberOfGuests: 0,
    price: 0,
    originalPrice: 0,
    taxesAndFeesUnderPrice: false,
}

export const defaultPlaceDetails = {
    title: "",
    rating: 0,
    address: "",
    review: 0,
    slug: "",
    imageUrl: "",
    description: "",
    longitude: 0,
    latitude: 0,
    services: {},
}
