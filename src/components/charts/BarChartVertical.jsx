import { Bar } from "react-chartjs-2"
import "~/styles/Chart.css"
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
} from "chart.js"
import PropTypes from "prop-types"
import { calculateAverageReviewScore } from "~/utils/uiHelper"
import { useEffect } from "react"

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const BarChartVertical = ({ places }) => {
    const labels = places.map((p) => p.hotel.name)
    const values = places.map((p) => calculateAverageReviewScore(p.hotel.reviews))

    useEffect(() => {
        console.log(places)
    }, [places])

    const backgroundColors = [
        "rgba(255, 99, 132, 0.7)",
        "rgba(255, 159, 64, 0.7)",
        "rgba(255, 205, 86, 0.7)",
        "rgba(75, 192, 192, 0.7)",
        "rgba(54, 162, 235, 0.7)",
    ]

    const data = {
        labels,
        datasets: [
            {
                label: "Điểm đánh giá",
                data: values,
                backgroundColor: backgroundColors,
                borderRadius: 8,
            },
        ],
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false, // Cho phép tự chỉnh chiều cao
        scales: {
            y: {
                beginAtZero: true,
                max: 10,
                title: {
                    display: true,
                    text: "Điểm đánh giá",
                    color: "#676767",
                },
            },
            x: {
                display: false,
            },
        },
        plugins: {
            legend: {
                display: false,
            },
        },
    }

    return (
        <div>
            <h1 className="chart-title">Top 10 khách sạn được đánh giá cao</h1>
            <div style={{ height: "350px", width: "100%" }}>
                <Bar data={data} options={options} />
            </div>
        </div>
    )
}

BarChartVertical.propTypes = {
    places: PropTypes.array.isRequired,
}
export default BarChartVertical
