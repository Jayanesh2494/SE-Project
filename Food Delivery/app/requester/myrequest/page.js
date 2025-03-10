"use client"
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Pagination,
  Spinner,
} from "@nextui-org/react";
import { FaSearch, FaChevronDown, FaEllipsisV } from "react-icons/fa";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { capitalize } from "../../data/utils";

const requesterColumns = [
  { name: "NEEDER", uid: "needer" },
  { name: "PRODUCT NAME", uid: "productName" },
  { name: "QUANTITY", uid: "quantity" },
  { name: "LAST DATE", uid: "lastDate", sortable: true },
  { name: "ADDRESS", uid: "address" },
  { name: "SPECIAL NOTE", uid: "specialNote" },
  { name: "STATUS", uid: "status", sortable: true },
  { name: "ACTIONS", uid: "actions" },
];

const statusOptions = {
  pending: {
    label: "Pending",
    color: "orange",
  },
  approved: {
    label: "Approved",
    color: "green",
  },
  rejected: {
    label: "Rejected",
    color: "red",
  },
  fulfilled: {
    label: "Fulfilled",
    color: "blue",
  },
};

const INITIAL_VISIBLE_COLUMNS = [
  "needer",
  "productName",
  "quantity",
  "lastDate",
  "address",
  "specialNote",
  "status",
  "actions",
];

export default function RequestersTable() {
  const [requesters, setRequesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState(new Set(INITIAL_VISIBLE_COLUMNS));
  const [statusFilter, setStatusFilter] = useState(new Set());
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "lastDate",
    direction: "ascending",
  });
  const [page, setPage] = useState(1);
  const { isLoaded, isSignedIn, user } = useUser();
  const [userId, setUserId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get("/api/users/myprofile");
        if (response.data.success) {
          setUserId(response.data.user._id);
        } else {
          console.error("Failed to fetch user profile:", response.data);
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    const fetchRequesters = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/requests");
        if (response.data.success) {
          if (response.data.success !== 0) {
            setRequesters(response.data.requests);
          }
        } else {
          console.error("Failed to fetch requesters:", response.data);
        }
      } catch (error) {
        console.error("Failed to fetch requesters:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequesters();
  }, []);

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`/api/requesters/${id}`);
      if (response.data.success) {
        setRequesters(requesters?.filter((requester) => requester._id !== id));
      } else {
        console.error("Failed to delete requester:", response.data);
      }
    } catch (error) {
      console.error("Failed to delete requester:", error);
    }
  };

  const handleView = (id) => {
    router.push(`/requester/${id}`);
  };

  const handleEdit = (id) => {
    router.push(`/requester/edit/${id}`);
  };

  const filteredRequesters = useMemo(() => {
    return requesters?.filter(
      (requester) =>
        requester.needer === userId &&
        (requester.needer.toLowerCase().includes(filterValue.toLowerCase()) ||
          requester.productName.toLowerCase().includes(filterValue.toLowerCase())) &&
        (statusFilter.size === 0 || statusFilter.has(requester.status))
    );
  }, [requesters, filterValue, userId, statusFilter]);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredRequesters.slice(start, end);
  }, [page, filteredRequesters, rowsPerPage]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = useCallback(
    (requester, columnKey) => {
      const cellValue = requester[columnKey];
      switch (columnKey) {
        case "needer":
        case "productName":
        case "quantity":
        case "lastDate":
        case "address":
        case "specialNote":
          return <span>{cellValue}</span>;
        case "status":
          const statusInfo = statusOptions[cellValue] || {};
          return (
            <span style={{ color: statusInfo.color, fontWeight: "bold" }}>
              {statusInfo.label}
            </span>
          );
        case "actions":
          return (
            <div className="relative flex justify-center items-center gap-2">
              <Dropdown>
                <DropdownTrigger>
                  <Button isIconOnly radius="full" size="sm" variant="light">
                    <FaEllipsisV className="text-default-400" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem onClick={() => handleView(requester._id)}>
                    View
                  </DropdownItem>
                  <DropdownItem onClick={() => handleEdit(requester._id)}>
                    Edit
                  </DropdownItem>
                  <DropdownItem onClick={() => handleDelete(requester._id)}>
                    Delete
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          );
        default:
          return cellValue;
      }
    },
    [handleDelete, handleView, handleEdit]
  );

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            classNames={{ base: "w-full sm:max-w-[44%]", inputWrapper: "border-1" }}
            placeholder="Search by needer or product..."
            size="sm"
            startContent={<FaSearch className="text-default-300" />}
            value={filterValue}
            variant="bordered"
            onClear={() => setFilterValue("")}
            onValueChange={setFilterValue}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger>
                <Button
                  endContent={<FaChevronDown className="text-small" />}
                  size="sm"
                  variant="flat"
                >
                  Status
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Request Status"
                closeOnSelect={false}
                selectedKeys={statusFilter}
                selectionMode="multiple"
                onSelectionChange={(keys) => setStatusFilter(new Set(keys))}
              >
                {Object.keys(statusOptions).map((key) => (
                  <DropdownItem key={key} className="capitalize">
                    {capitalize(statusOptions[key].label)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger>
                <Button
                  endContent={<FaChevronDown className="text-small" />}
                  size="sm"
                  variant="flat"
                >
                  Columns
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Columns"
                closeOnSelect={false}
                disallowEmptySelection
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={setVisibleColumns}
              >
                {requesterColumns.map((column) => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {capitalize(column.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </div>
    );
  }, [filterValue, visibleColumns, statusFilter]);

  return (
    <div className="w-full overflow-hidden">
      <div className="flex flex-col gap-2">
        {topContent}
        <div className="overflow-scroll">
          {loading ? (
            <Spinner />
          ) : (
            <Table aria-label="Requesters Table" selectionMode="multiple" selectedKeys={selectedKeys}>
              <TableHeader>
                {requesterColumns.map(
                  (column) =>
                    visibleColumns.has(column.uid) && (
                      <TableColumn key={column.uid} align="start">
                        {column.name}
                      </TableColumn>
                    )
                )}
              </TableHeader>
              <TableBody items={sortedItems} renderCell={renderCell} />
            </Table>
          )}
        </div>
        <Pagination
          total={filteredRequesters.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={setPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(e.target.value);
            setPage(1);
          }}
        />
      </div>
    </div>
  );
}
