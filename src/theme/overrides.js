const overrides = {
    MuiOutlinedInput: {
        styleOverrides: {
            root: {
                height:"40px",
                width: "100%",
                margin: "6px 0 15px",
                "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#d1d5db",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#00a6a9",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#00a6a9",
                },
            },
        },
    },
    // MuiButtonBase: {
    //     styleOverrides: {
    //         root: {
    //             // display: "none"
    //         }
    //     }
    // }
}

export default overrides
