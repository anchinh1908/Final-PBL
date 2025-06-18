import PropTypes from "prop-types"

const ReviewBar = ({ label, score }) => {
    const maxScore = 10
    const percentage = (score / maxScore) * 100

    const getReviewColor = (score) => {
        if (score < 6) return "bg-red-400"
        if (score == 10) return "bg-green-400"
        return "bg-yellow-400"
    }

    return (
        <div className="mb-3">
            <div className="flex justify-between mb-1 text-sm font-medium">
                <span>{label}</span>
                <span>{score.toFixed(1).replace(".", ",")}</span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className={`${getReviewColor(score)} h-2 rounded-full`}
                    style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    )
}

ReviewBar.propTypes = {
    label: PropTypes.string.isRequired,
    score: PropTypes.number.isRequired,
}

export default ReviewBar
