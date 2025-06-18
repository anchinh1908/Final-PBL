import { FaChevronLeft, FaChevronRight } from "react-icons/fa"
import ReactPaginate from "react-paginate"
import PropTypes from "prop-types"
import "~/styles/PaginateCustom.css"

const PaginationCustom = ({ pageCount, pageRangeDisplayed, onPageChange }) => {
    return (
        <div className="my-5">
            <ReactPaginate
                breakLabel="..."
                nextLabel=<FaChevronRight size={12} />
                onPageChange={onPageChange}
                pageRangeDisplayed={pageRangeDisplayed}
                pageCount={pageCount}
                previousLabel=<FaChevronLeft size={12} />
                renderOnZeroPageCount={null}
                pageClassName="page-item"
                pageLinkClassName="page-link"
                breakClassName="page-item"
                breakLinkClassName="page-link"
                containerClassName="container"
                activeClassName="active-item"
                activeLinkClassName="active-link"
                previousClassName="page-item"
                previousLinkClassName="page-link"
                nextClassName="page-item"
                nextLinkClassName="page-link"
                disabledClassName="disabled-item"
                disabledLinkClassName="disabled-link"
            />
        </div>
    )
}

PaginationCustom.propTypes = {
    pageCount: PropTypes.number.isRequired,
    pageRangeDisplayed: PropTypes.number.isRequired,
    onPageChange: PropTypes.func,
}

export default PaginationCustom
