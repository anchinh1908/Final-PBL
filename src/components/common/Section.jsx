import PropTypes from "prop-types"

const Section = ({ title, items }) => {
    return (
        <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">{title}</h2>
            <ul className="mt-2">
                {items.map((item, index) => (
                    <li key={index} className="flex items-center text-gray-600 py-1">
                        <span className="text-green-500 mr-2">✔</span>
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    )
}

Section.propTypes = {
    title: PropTypes.string.isRequired,
    items: PropTypes.array.isRequired,
}

export default Section
