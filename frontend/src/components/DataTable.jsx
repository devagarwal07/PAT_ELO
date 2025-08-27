import React from 'react';
import './DataTable.css';

const DataTable = ({ 
  data = [], 
  columns = [], 
  loading = false, 
  onRowClick = null,
  pagination = null 
}) => {
  if (loading) {
    return (
      <div className="data-table-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="data-table-empty">
        <p>No data available</p>
      </div>
    );
  }

  return (
    <div className="data-table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index} className={column.className || ''}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr 
              key={rowIndex} 
              onClick={() => onRowClick && onRowClick(row)}
              className={onRowClick ? 'clickable' : ''}
            >
              {columns.map((column, colIndex) => (
                <td key={colIndex} className={column.className || ''}>
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {pagination && (
        <div className="table-pagination">
          <span>
            Showing {pagination.start} to {pagination.end} of {pagination.total} entries
          </span>
          <div className="pagination-controls">
            <button 
              onClick={pagination.onPrevious} 
              disabled={!pagination.hasPrevious}
            >
              Previous
            </button>
            <span>Page {pagination.current}</span>
            <button 
              onClick={pagination.onNext} 
              disabled={!pagination.hasNext}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
