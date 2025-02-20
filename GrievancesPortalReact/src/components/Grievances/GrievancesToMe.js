import React, { useEffect, useState, useCallback } from "react";
import GrievancesItem from "./GrievancesItem"; // Ensure the correct path to GrievancesItem
import api from "../../services/api"; // Ensure the correct path to your API service
import { Blocks } from "react-loader-spinner";
import { useMyContext } from "../../store/ContextApi"; // Import context to get user data
import toast from "react-hot-toast"; // For notifications

const GrievancesToMe = () => {
  const { token, userEmail, userName } = useMyContext(); // Get token, user email, and username from context
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // State to manage error

  // Function to fetch grievances assigned to the logged-in user
  const fetchGrievances = useCallback(async () => {
    setLoading(true); // Set loading state before fetching
    setError(null); // Reset error state
    try {
      const response = await api.get("/grievances/to-me", {
        params: { email: userEmail }, // Pass the logged-in user's email
      });
      
      // Sort grievances by createdAt in descending order
      const sortedGrievances = response.data.sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      setGrievances(sortedGrievances);
    } catch (error) {
      console.error("Error fetching grievances:", error);
      setError("Failed to fetch grievances."); // Set error message
      toast.error("Failed to fetch grievances."); // Notify user of error
    } finally {
      setLoading(false);
    }
  }, [userEmail]); // Recreate the function only when userEmail changes

  // Handle deletion of a grievance
  const handleDeleteGrievance = (id) => {
    setGrievances((prevGrievances) =>
      prevGrievances.filter((grievance) => grievance.id !== id)
    );
  };

  // Handle upvoting a grievance
  const handleUpvote = async (id) => {
    try {
      const response = await api.put(`/grievances/${id}/upvote`, null, {
        params: { userName }, // Use current user name from context
      });
      if (response.status === 200) {
        // Update grievances state with the new upvote count
        setGrievances((prevGrievances) =>
          prevGrievances.map((grievance) =>
            grievance.id === id
              ? {
                  ...grievance,
                  upvoteCount: response.data.upvoteCount,
                  upvotedUsers: response.data.usersWhoUpvoted,
                }
              : grievance
          )
        );
      }
    } catch (error) {
      console.error("Failed to upvote:", error);
      toast.error("Failed to upvote the grievance."); // Notify user of error
    }
  };

  // Fetch grievances when the component mounts
  useEffect(() => {
    if (token && userEmail) {
      fetchGrievances(); // Fetch grievances if the user is logged in
    }
  }, [token, userEmail, fetchGrievances]); // Include fetchGrievances in the dependencies

  return (
    <div className="min-h-[calc(100vh-74px)] flex flex-col items-center justify-center">
      {loading ? (
        <div className="flex flex-col justify-center items-center h-72">
          <Blocks
            height="70"
            width="70"
            color="#4fa94d"
            ariaLabel="blocks-loading"
            visible={true}
          />
          <span>Please wait...</span>
        </div>
      ) : error ? ( // Check for errors
        <h2 className="text-xl font-bold text-red-600">
          {error}
        </h2>
      ) : (
        <div className="w-[70%] mx-auto"> {/* Container for consistent width */}
          <h1 className="font-montserrat text-slate-800 sm:text-4xl text-2xl font-semibold text-center my-6">
            Grievances To Me
          </h1>
          {grievances.length > 0 ? (
            grievances.map((item) => (
              <GrievancesItem
                key={item.id}
                id={item.id}
                content={item.content}
                department={item.department}
                concernedStaffEmail={item.concernedStaffEmail}
                createdAt={item.createdAt}
                isSolved={item.isSolved}
                upvoteCount={item.upvoteCount}
                hasUpvoted={item.upvotedUsers ? item.upvotedUsers.includes(userName) : false} // Check if user has upvoted
                onDelete={handleDeleteGrievance} // Handle deletion
                fetchGrievances={fetchGrievances} // Pass fetchGrievances for re-fetching if needed
                handleUpvote={() => handleUpvote(item.id)} // Upvote handler
                studentEmail={item.studentEmail} // Pass the student email if required
              />
            ))
          ) : (
            <h2 className="text-2xl font-bold text-gray-800">
              No grievances assigned to you.
            </h2>
          )}
        </div>
      )}
    </div>
  );
};

export default GrievancesToMe;
