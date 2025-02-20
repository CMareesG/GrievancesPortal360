import React, { useState } from "react";
import { FiTrash, FiArrowUp } from "react-icons/fi";
import { FaCheck } from "react-icons/fa"; // For the solved checkmark
import api from "../../services/api";
import toast from "react-hot-toast";

const GrievancesItem = ({
  id,
  content,
  department,
  concernedStaffEmail,
  studentEmail, // Add this line to accept studentEmail
  createdAt,
  isSolved: initialSolved,
  onDelete,
  fetchGrievances,
  upvoteCount: initialUpvoteCount,
  hasUpvoted: initialHasUpvoted,
}) => {
  const [isSolved, setIsSolved] = useState(initialSolved);
  const [upvoteCount, setUpvoteCount] = useState(initialUpvoteCount);
  const [hasUpvoted, setHasUpvoted] = useState(initialHasUpvoted);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
  
    // Determine AM or PM suffix
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12; // Convert to 12-hour format
    hours = hours ? String(hours).padStart(2, '0') : '12'; // Show 12 instead of 0
  
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds} ${ampm}`;
  };
  
  const toggleSolvedStatus = async () => {
    try {
      const response = await api.put(`/grievances/${id}/toggle-solved`);
      if (response.status === 200) {
        setIsSolved(!isSolved);
        toast.success(`Status changed to ${!isSolved ? "Solved" : "Not Solved"}`);
        await fetchGrievances(); // Fetch updated details
      } else {
        toast.error(response.data);
      }
    } catch (error) {
      toast.error("Error toggling solved status");
    }
  };

  const handleDelete = async () => {
    try {
      const response = await api.delete(`/grievances/${id}`);
      if (response.status === 200) {
        toast.success("Grievance deleted successfully");
        onDelete(id); // Call the parent delete handler with the grievance ID
      } else {
        toast.error("Failed to delete grievance");
      }
    } catch (error) {
      toast.error("Error deleting grievance");
    }
  };

  const handleUpvote = async () => {
    try {
      const response = await api.put(`/grievances/${id}/upvote`);
      if (response.status === 200) {
        setUpvoteCount(response.data.upvoteCount);
        setHasUpvoted(true); // Mark as upvoted
        toast.success("You upvoted this grievance");
      }
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error("You have already upvoted this grievance");
      } else {
        toast.error("Error upvoting grievance");
      }
    }
  };

  return (
    <div className="relative border p-6 mb-4 rounded-lg shadow-lg w-[800px] mx-auto bg-white transition-transform duration-300 hover:shadow-xl"> {/* Updated width */}
      <div className="absolute top-2 left-2">
        <p className="text-gray-500 text-sm font-medium">
          {createdAt ? formatDate(createdAt) : "No Date"}
        </p>
      </div>
      <div className="absolute top-2 right-2">
        <button
          onClick={toggleSolvedStatus}
          className={`px-3 py-1 rounded-full text-sm font-semibold shadow-md focus:outline-none ${isSolved ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}
        >
          {isSolved ? (
            <>
              <FaCheck className="inline-block mr-1" />
              Solved
            </>
          ) : (
            "Not Solved"
          )}
        </button>
      </div>
      <div className="text-center">
        <h2 className="font-bold text-xl text-blue-600 mb-4">Grievance</h2>
        <div className="text-left inline-block">
          <div className="text-gray-800 mb-2">
            <strong>Student Email:</strong> {studentEmail || "Not specified"}
          </div>
          <div className="text-gray-800 mb-2">
            <strong>Content:</strong> {content || "No Content"}
          </div>
          <div className="text-gray-800 mb-2">
            <strong>Department:</strong> {department || "Not specified"}
          </div>
          <div className="text-gray-800 mb-2">
            <strong>Concerned Staff Email:</strong> {concernedStaffEmail || "Not specified"}
          </div>
        </div>
      </div>
      <div className="absolute bottom-2 right-2 flex items-center">
        <div
          className={`flex items-center cursor-pointer bg-gray-200 rounded-full px-3 py-1 mr-4 ${hasUpvoted ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={hasUpvoted ? null : handleUpvote}
        >
          <FiArrowUp className={`text-green-500 hover:text-green-700 ${hasUpvoted ? 'text-green-700' : ''}`} size={20} />
          <span className="text-green-500 ml-1">{upvoteCount}</span>
        </div>
        <FiTrash
          className={`text-red-500 cursor-pointer hover:text-red-700 ${isSolved ? "opacity-50 cursor-not-allowed" : ""}`}
          size={24}
          onClick={() => {
            if (isSolved) {
              toast.error("Cannot delete a solved grievance");
            } else {
              handleDelete();
            }
          }}
        />
      </div>
    </div>
  );
};

export default GrievancesItem;
