/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,jsx}"],
    theme: {
        extend: {
            transitionProperty: {
                width: "width",
            },
            colors: {
                persianGreen: "#00a6a9",
                wewak: "#f2a7b4",
                lightBackground: "#f5f5f5",
                // lightGray: "#d1d5db",
                lightGreen: "#00d0d3",
                darkGreen: "#006f6b",
                mediumDarkGreen: "#006f6b",
                bgGreen: "#f2fbfb",
                dGreen: "#e6f7f7",
                ryanGreen: "#00d8dc",
                background: "#fafafa",
                rowTable: "#efefef",

                silver: "#cdcdcd",
                creamyIvory: "#fffbeb",
                pureWhite: "#ffffff",
                deepBlack: "#000000",
                slateGray: "#4b4b4b",
                sunsetOrange: "#f4a261",
                coralBlaze: "#e76f51",
                aquaMist: "#a8dadc",
                oceanSlate: "#457b9d",
                silverMist: "#eeeeee",
                clear: "transparent",
                shadowBlack: "rgba(0,0,0,0.5)",
                github: "#1f2937",
                google: "#dc2626",
                facebook: "#2563eb",
                lightGray: "#f1f1f1"
            },
        },
    },
    plugins: [],
}
