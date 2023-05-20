import React, { useState } from 'react';
import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, Paper, Button, TextField } from '@material-ui/core';
import { jsPDF } from 'jspdf';
import { CSVLink } from 'react-csv';
import autoTable from 'jspdf-autotable';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  tableHead: {
    boxShadow: theme.shadows[0], // Add additional elevation
  },
  firstColumn: {
    marginLeft: theme.spacing(1), // Add margin to the first column
  },
}));
type DataTableProps = {
  data: any[]; // Array of data objects
  columns: any[]; // Array of column objects
};

const DataTable: React.FC<DataTableProps> = ({ data, columns }) => {
  const [filter, setFilter] = useState('');
  console.log(data);
  const filteredData = data.filter((row) =>
    Object.values(row).some((value) => String(value).toLowerCase().includes(filter.toLowerCase()))
    || Object.values(row.data).some((value) => String(value).toLowerCase().includes(filter.toLowerCase()))
  );

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.value);
  };

  const handleExportPDF = () => {
    // Prepare PDF data
    const doc = new jsPDF();
    const tableData = filteredData.map((row) => columns.map((column) => row[column.key]));

    // Set table headers
    const tableHeaders = columns.map((column) => column.label);
    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
    });

    // Save PDF
    doc.save('DataTableExport.pdf');
  };
  const classes = useStyles();

  return (
    <div>

<TableContainer component={Paper}>
  <Table>
  <TableHead className={classes.tableHead}>
          <TableRow>
            {columns.map((column, index) => (
              <TableCell key={column.key} className={index === 0 ? classes.firstColumn : ''}>
                {column.label}
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell colSpan={columns.length}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {/* ... */}
              </div>
            </TableCell>
          </TableRow>
        </TableHead>

    <TableBody>
      {filteredData.map((row, index) => (
        <TableRow key={index}> 
          <TableCell key={"Report Type"}>{row['report_type']}</TableCell>
          <TableCell key={"Date"}>{row['data'].date}</TableCell>
          <TableCell key={"Amount"}>{row['data'].amount}</TableCell>
          <TableCell key={"Region"}>{row['data'].region}</TableCell>
        </TableRow>
      ))}
    </TableBody>
    <TableRow>
        <TableCell colSpan={columns.length}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              label="Filter"
              variant="outlined"
              size="small" // Set the size to "small"
              value={filter}
              onChange={handleFilterChange}
              style={{ marginRight: '10px', width: '200px' }} // Set custom width
            />
            <Button variant="contained" onClick={handleExportPDF} style={{ marginRight: '10px' }}>
              Export PDF
            </Button>
            <CSVLink data={filteredData} headers={columns} filename="DataTableExport.csv" style={{ marginRight: '10px' }}>
              <Button variant="contained">Export CSV</Button>
            </CSVLink>
          </div>
        </TableCell>
      </TableRow>
  </Table>
</TableContainer>

    </div>
  );
};

export default DataTable;
