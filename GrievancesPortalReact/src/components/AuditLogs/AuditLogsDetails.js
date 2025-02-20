import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { Link } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import { Blocks } from "react-loader-spinner";
import toast from "react-hot-toast";
import { auditLogsTruncateTexts } from "../../utils/truncateText.js";
import Errors from "../Errors.js";
import moment from "moment";
import { MdDateRange } from "react-icons/md";

export const auditLogcolumns = [
  {
    field: "actions",
    headerName: "Action",
    width: 160,
    headerAlign: "center",
    disableColumnMenu: true,
    align: "center",
    editable: false,
    headerClassName: "text-black font-semibold border",
    cellClassName: "text-slate-700 font-normal border",
  },
  {
    field: "username",
    headerName: "UserName",
    width: 180,
    editable: false,
    disableColumnMenu: true,
    headerAlign: "center",
    align: "center",
    headerClassName: "text-black font-semibold border",
    cellClassName: "text-slate-700 font-normal border",
  },
  {
    field: "timestamp",
    headerName: "TimeStamp",
    disableColumnMenu: true,
    width: 220,
    editable: false,
    headerAlign: "center",
    align: "center",
    headerClassName: "text-black font-semibold border",
    cellClassName: "text-slate-700 font-normal border",
    renderCell: (params) => (
      <div className="flex items-center justify-center gap-1">
        <span>
          <MdDateRange className="text-slate-700 text-lg" />
        </span>
        <span>{params?.row?.timestamp}</span>
      </div>
    ),
  },
  {
    field: "grievanceId",
    headerName: "GrievanceId",
    disableColumnMenu: true,
    width: 150,
    editable: false,
    headerAlign: "center",
    align: "center",
    headerClassName: "text-black font-semibold border",
    cellClassName: "text-slate-700 font-normal border",
  },
  {
    field: "grievance",
    headerName: "Grievance Content",
    width: 220,
    editable: false,
    headerAlign: "center",
    disableColumnMenu: true,
    align: "center",
    headerClassName: "text-black font-semibold border",
    cellClassName: "text-slate-700 font-normal border",
    renderCell: (params) => {
      let contentDisplay = "Invalid content format";
      try {
        if (params.value) {
          const parsedValue = JSON.parse(params.value);
          contentDisplay = parsedValue?.content || "No content available";
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
      return (
        <p className="text-slate-700 text-center">
          {auditLogsTruncateTexts(contentDisplay)}
        </p>
      );
    },
  },
  {
    field: "view",
    headerName: "View",
    width: 150,
    editable: false,
    headerAlign: "center",
    align: "center",
    headerClassName: "text-black font-semibold",
    cellClassName: "text-slate-700 font-normal",
    renderCell: (params) => (
      <Link to={`/admin/audit-logs/${params.row.noteId}`} className="h-full flex justify-center items-center">
        <button className="bg-btnColor text-white px-4 flex justify-center items-center h-9 rounded-md">View</button>
      </Link>
    ),
  },
];

const AdminAuditLogs = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get("/audit");
      setAuditLogs(response.data);
    } catch (err) {
      console.error(err); // Log the error for debugging
      setError(err?.response?.data?.message);
      toast.error("Error fetching audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const rows = auditLogs.map((item) => {
    const formattedDate = moment(item.timestamp).format("MMMM DD, YYYY, hh:mm A");
    return {
      id: item.id,
      noteId: item.noteId,
      actions: item.action,
      username: item.username,
      timestamp: formattedDate,
      note: item.noteContent,
    };
  });

  if (error) {
    return <Errors message={error} />;
  }

  return (
    <div className="p-4">
      <div className="py-4">
        <h1 className="text-center text-2xl font-bold text-slate-800 uppercase">Audit Logs</h1>
      </div>
      {loading ? (
        <div className="flex flex-col justify-center items-center h-72">
          <Blocks height="70" width="70" color="#4fa94d" ariaLabel="blocks-loading" visible={true} />
          <span>Please wait...</span>
        </div>
      ) : (
        <div className="overflow-x-auto w-full mx-auto">
          {rows.length === 0 ? (
            <div className="text-center text-slate-700">No audit logs available.</div>
          ) : (
            <DataGrid
              className="w-fit mx-auto px-0"
              rows={rows}
              columns={auditLogcolumns}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 6,
                  },
                },
              }}
              pageSizeOptions={[6]}
              disableRowSelectionOnClick
              disableColumnResize
            />
          )}
        </div>
      )}
    </div>
  );
};

export default AdminAuditLogs;
