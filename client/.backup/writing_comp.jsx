export const TableComp = ({
    data,
    columns,
    pageSize = 10,
    searchable = true,
    sortable = true,
}) => {
    /*
    const columns = [
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        {
            key: "status",
            label: "Status",
            // Custom renderer example
            render: (value, row) => (
                <span
                    className={`px-2 py-1 rounded-full text-xs ${
                        value === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                    }`}
                >
                    {value}
                </span>
            ),
        },
    ];

    const data = [
        { name: "John Doe", email: "john@example.com", status: "active" },
        { name: "Jane Smith", email: "jane@example.com", status: "inactive" },
        // ... more data
    ];
    */
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: null,
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPageSize, setCurrentPageSize] = useState(pageSize);

    // Sort function
    const sortData = (data, sortConfig) => {
        if (!sortConfig.key) return data;

        return [...data].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue === null || aValue === undefined) return 1;
            if (bValue === null || bValue === undefined) return -1;

            const comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
            return sortConfig.direction === "asc" ? comparison : -comparison;
        });
    };

    // Filter function
    const filterData = (data, searchTerm) => {
        if (!searchTerm) return data;

        return data.filter((item) =>
            Object.values(item).some((value) =>
                String(value).toLowerCase().includes(searchTerm.toLowerCase()),
            ),
        );
    };

    // Memoized data processing
    const processedData = useMemo(() => {
        let result = [...data];
        result = filterData(result, searchTerm);
        result = sortData(result, sortConfig);
        return result;
    }, [data, searchTerm, sortConfig]);

    // Pagination calculations
    const totalPages = Math.ceil(processedData.length / currentPageSize);
    const startIndex = (currentPage - 1) * currentPageSize;
    const endIndex = startIndex + currentPageSize;
    const currentData = processedData.slice(startIndex, endIndex);

    // Sort handler
    const handleSort = (key) => {
        setSortConfig((prevConfig) => ({
            key,
            direction:
                prevConfig.key === key && prevConfig.direction === "asc"
                    ? "desc"
                    : "asc",
        }));
    };

    // Render sort icon
    const renderSortIcon = (columnKey) => {
        if (!sortable) return null;
        if (sortConfig.key !== columnKey)
            return <ChevronsUpDown className="size-4" />;
        return sortConfig.direction === "asc" ? (
            <ChevronUp className="size-4" />
        ) : (
            <ChevronDown className="size-4" />
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                {searchable && (
                    <div className="relative w-72">
                        <Search className="absolute left-2 top-2.5 size-4 text-gray-500" />
                        <Input
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                )}
                <Select
                    value={String(currentPageSize)}
                    onValueChange={(value) => {
                        setCurrentPageSize(Number(value));
                        setCurrentPage(1);
                    }}
                >
                    <SelectTrigger className="w-32">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {[5, 10, 20, 50].map((size) => (
                            <SelectItem key={size} value={String(size)}>
                                {size} per page
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="rounded-md border">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className="px-4 py-3 text-left font-medium text-gray-500"
                                >
                                    <div
                                        className={`flex items-center space-x-1 ${
                                            sortable ? "cursor-pointer" : ""
                                        }`}
                                        onClick={() =>
                                            sortable && handleSort(column.key)
                                        }
                                    >
                                        <span>{column.label}</span>
                                        {renderSortIcon(column.key)}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {currentData.map((row, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                {columns.map((column) => (
                                    <td
                                        key={column.key}
                                        className="px-4 py-3 text-gray-900"
                                    >
                                        {column.render
                                            ? column.render(
                                                  row[column.key],
                                                  row,
                                              )
                                            : row[column.key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                    Showing {startIndex + 1} to{" "}
                    {Math.min(endIndex, processedData.length)} of{" "}
                    {processedData.length} results
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="size-4" />
                    </Button>
                    <div className="text-sm">
                        Page {currentPage} of {totalPages}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            setCurrentPage((prev) =>
                                Math.min(prev + 1, totalPages),
                            )
                        }
                        disabled={currentPage === totalPages}
                    >
                        <ChevronRight className="size-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

TableComp.propTypes = {
    data: PropTypes.array.isRequired,
    columns: PropTypes.array.isRequired,
    pageSize: PropTypes.number,
    searchable: PropTypes.bool,
    sortable: PropTypes.bool,
};
