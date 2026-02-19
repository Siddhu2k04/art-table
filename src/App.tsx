import { useEffect, useState } from "react";
import "./App.css";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

export interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
}

export interface ApiResponse {
  data: Artwork[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    total_pages: number;
    current_page: number;
  };
}


function App() {
  // ==============================
  // STATE
  // ==============================

  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selectCount, setSelectCount] = useState<string>("");

  // ==============================
  // FETCH FUNCTION (SERVER SIDE)
  // ==============================

  const fetchArtworks = async (page: number) => {
    try {
      setLoading(true);

      const response = await fetch(
        `https://api.artic.edu/api/v1/artworks?page=${page}`
      );

      const data: ApiResponse = await response.json();

      setArtworks(data.data);
      setTotalRecords(data.pagination.total);
    } catch (error) {
      console.error("Error fetching artworks:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load data when page changes
  useEffect(() => {
    fetchArtworks(currentPage);
  }, [currentPage]);

  // ==============================
  // PERSISTENT SELECTION LOGIC
  // ==============================

  // Derive selected rows for current page
  const selectedRows = artworks.filter((art) =>
    selectedIds.has(art.id)
  );

  const handleSelectionChange = (e: any) => {
    const currentPageIds = artworks.map((a) => a.id);
    const updatedSelection = new Set(selectedIds);

    // Remove current page ids first
    currentPageIds.forEach((id) => {
      updatedSelection.delete(id);
    });

    // Add selected ones back
    (e.value as Artwork[]).forEach((row) => {
      updatedSelection.add(row.id);
    });

    setSelectedIds(updatedSelection);
  };

  // ==============================
  // CUSTOM ROW SELECTION (NO PREFETCHING)
  // ==============================

  const handleCustomSelect = () => {
    const count = parseInt(selectCount);

    if (!count || count <= 0) {
      alert("Enter valid number");
      return;
    }

    const updatedSelection = new Set(selectedIds);

    // Select only from current page
    const rowsToSelect = artworks.slice(0, count);

    rowsToSelect.forEach((row) => {
      updatedSelection.add(row.id);
    });

    setSelectedIds(updatedSelection);
    setSelectCount("");
  };

  // ==============================
  // UI
  // ==============================

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Art Institute of Chicago - Artworks</h2>

      {/* Custom Selection Panel */}
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="number"
          value={selectCount}
          onChange={(e) => setSelectCount(e.target.value)}
          placeholder="Enter number of rows"
          style={{ marginRight: "0.5rem" }}
        />
        <button onClick={handleCustomSelect}>
          Select Rows
        </button>
      </div>

      <DataTable
        value={artworks}
        paginator
        rows={12}
        totalRecords={totalRecords}
        first={(currentPage - 1) * 12}
        lazy
        loading={loading}
        dataKey="id"
        selection={selectedRows}
        onSelectionChange={handleSelectionChange}
        onPage={(e) => {
          const newPage = (e.page ?? 0) + 1;
          setCurrentPage(newPage);
        }}
      >
        {/* Checkbox column FIRST */}
        <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />

        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Place of Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Start Date" />
        <Column field="date_end" header="End Date" />
      </DataTable>
    </div>
  );
}

export default App;
