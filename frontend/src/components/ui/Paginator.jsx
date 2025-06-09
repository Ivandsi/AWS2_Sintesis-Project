import { useState } from "react";
import "./Paginator.css";

const Paginator = ({ page, totalPages, onPageChange, maxVisible = 6 }) => {
  maxVisible = Math.max(5, maxVisible); // Ensure at least 5
  const [jumpInput, setJumpInput] = useState("");
  const [showInput, setShowInput] = useState(false);

  if (totalPages <= 1) return null;

  const handleJump = (e) => {
    e.preventDefault();
    const num = parseInt(jumpInput, 10);
    if (num >= 1 && num <= totalPages) {
      onPageChange(num);
      setShowInput(false);
      setJumpInput("");
    }
  };

  const renderJumpInput = (key) =>
    showInput ? (
      <form
        key={key}
        className="paginator-jump-form"
        onSubmit={handleJump}
        style={{ display: "inline" }}
      >
        <input
          className="paginator-jump-input"
          type="number"
          min={1}
          max={totalPages}
          value={jumpInput}
          onChange={(e) => setJumpInput(e.target.value)}
          autoFocus
          style={{ width: "3em" }}
        />
      </form>
    ) : (
      <button
        key={key}
        className="paginator-btn"
        onClick={() => setShowInput(true)}
        title="Ir a página"
      >
        #
      </button>
    );

  const getPages = () => {
    const pages = [];
    const showAll = totalPages <= maxVisible - 2;

    if (showAll) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);

    const half = Math.ceil(totalPages / 2);

    if (page !== 1 && page !== totalPages) {
      if (page <= half) {
        // Show jump input after selected page
        pages.push(page);
        pages.push("jump-input");
      } else {
        // Show jump input before selected page
        pages.push("jump-input");
        pages.push(page);
      }
    } else if (page === 1) {
      // First page selected, jump input after
      pages.push("jump-input");
    } else if (page === totalPages) {
      // Last page selected, jump input before
      pages.push("jump-input");
    }

    pages.push(totalPages);

    return pages;
  };

  return (
    <nav className="paginator">
      <button
        className="paginator-btn"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >
        &laquo;
      </button>
      {getPages().map((p, idx) => {
        if (p === "jump-input") {
          return renderJumpInput("jump" + idx);
        }
        return (
          <button
            key={p}
            className={`paginator-btn${p === page ? " active" : ""}`}
            onClick={() => onPageChange(p)}
            disabled={p === page}
          >
            {p}
          </button>
        );
      })}
      <button
        className="paginator-btn"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        &raquo;
      </button>
    </nav>
  );
};

export default Paginator;
