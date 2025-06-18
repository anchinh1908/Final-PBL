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
import { useEffect, useState } from "react"
import PropTypes from "prop-types"

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const BarChart = ({ places }) => {
    const options = {
        responsive: true,
        indexAxis: "y",
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    align: "center",
                    text: "Sản phẩm",
                    color: "#676767",
                },
            },
        },
    }

    const labels = places.map((p) => p.title)
    const values = places.map((p) => p.rating)

    const data = {
        labels: labels,
        datasets: [
            {
                label: "My First Dataset",
                data: values,
                backgroundColor: [
                    "rgba(255, 99, 132, 0.5)",
                    "rgba(255, 159, 64, 0.5)",
                    "rgba(255, 205, 86, 0.5)",
                    "rgba(75, 192, 192, 0.5)",
                    "rgba(54, 162, 235, 0.5)",
                    "rgba(153, 102, 255, 0.5)",
                    "rgba(201, 203, 207, 0.5)",
                ],
                // barThickness: 15,
            },
        ],
    }

    const [height, setHeight] = useState("350px") // Default height

    useEffect(() => {
        const handleResize = () => {
            const screenWidth = window.innerWidth
            if (screenWidth < 480) setHeight("250px")
            else if (screenWidth < 768) setHeight("300px")
            else setHeight("350px")
        }

        window.addEventListener("resize", handleResize)
        handleResize() // Gọi lần đầu để set giá trị ban đầu

        return () => window.removeEventListener("resize", handleResize)
    }, [])

    return (
        <div>
            <h1 className="chart-title">Top 5 địa điểm tham quan được đánh giá cao</h1>
            <Bar data={data} options={options} height={height} />
        </div>
    )
}

BarChart.propTypes = {
    places: PropTypes.array.isRequired,
}

export default BarChart
