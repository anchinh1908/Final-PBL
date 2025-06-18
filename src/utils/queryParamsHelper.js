export const getAdminProductParams = (page, rowsPerPage, searchKey) => {
    const params = []

    if (page > 1) {
        params.push(`page=${page}`)
    }
    if (rowsPerPage !== 15) {
        params.push(`rowsPerPage=${rowsPerPage}`)
    }
    if (searchKey) {
        params.push(`key=${searchKey}`)
    }

    return params.length > 0 ? `?${params.join("&")}` : ""
}

export const getAdminPlaceParams = (page, searchKey) => {
    const params = []

    if (page > 1) {
        params.push(`page=${page}`)
    }
    if (searchKey) {
        params.push(`key=${searchKey}`)
    }

    return params.length > 0 ? `?${params.join("&")}` : ""
}

export const getAdminOrderParams = (page, orderStatus, startTime, endTime, searchKey) => {
    const params = []

    if (page > 1) {
        params.push(`page=${page}`)
    }
    // if (rowsPerPage !== 10) {
    //     params.push(`rowsPerPage=${rowsPerPage}`);
    // }
    if (searchKey) {
        params.push(`key=${searchKey}`)
    }

    return params.length > 0 ? `?${params.join("&")}` : ""
}

export const getHotelParams = (page, size, searchQuery, district, numberOfGuests, maxPrice) => {
    const params = []

    if (page > 1) params.push(`page=${page}`)

    if (size !== 20) params.push(`size=${size}`)

    if (searchQuery) params.push(`key=${searchQuery}`)

    if (district) params.push(`district=${district}`)
    if (numberOfGuests && numberOfGuests > 0) params.push(`numberOfGuests=${numberOfGuests}`)
    if (maxPrice && maxPrice > 0) params.push(`maxPrice=${maxPrice}`)

    return params.length > 0 ? `?${params.join("&")}` : ""
}

export const getSearchHotelByFilterParams = (district, numberOfGuests, maxPrice, page) => {
    const params = []
    if (district) params.push(`district=${district}`)
    if (numberOfGuests && numberOfGuests > 0) params.push(`numberOfGuests=${numberOfGuests}`)
    if (maxPrice && maxPrice > 0) params.push(`maxPrice=${maxPrice}`)
    if (page > 1) params.push(`page=${page}`)

    return params.length > 0 ? `${params.join("&")}` : ""
}
