// AllGrievances.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import GrievancesItem from "./GrievancesItem";
import { Blocks } from "react-loader-spinner";
import { FiFilePlus } from "react-icons/fi";
import api from "../../services/api";
import "./AllGrievances.css";

const AllGrievances = () => {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGrievances = async () => {
    try {
      const response = await api.get("/grievances");
      const sortedGrievances = response.data.sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setGrievances(sortedGrievances);
    } catch (error) {
      console.error("Error fetching grievances:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGrievance = (id) => {
    setGrievances((prevGrievances) =>
      prevGrievances.filter((grievance) => grievance.id !== id)
    );
  };

  const handleUpvote = async (id) => {
    try {
      const response = await api.put(`/grievances/${id}/upvote`, null, {
        params: { userName: "currentUserName" }, // Replace with the actual username
      });
      if (response.status === 200) {
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
    }
  };

  useEffect(() => {
    fetchGrievances();
  }, []);

  return (
    <div className="min-h-[calc(100vh-74px)] sm:py-10 sm:px-5 px-0 py-4">
      <div className="w-[70%] mx-auto">
        {!loading && grievances.length > 0 && (
          <h1 className="font-montserrat text-slate-800 sm:text-4xl text-2xl font-semibold text-center my-6">
            My Grievances
          </h1>
        )}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-72">
            <Blocks height="70" width="70" color="#4fa94d" ariaLabel="blocks-loading" visible={true} />
            <span>Please wait...</span>
          </div>
        ) : (
          <>
            {grievances.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-96 p-4">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    No grievances available.
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Start by creating a new grievance to express your concerns.
                  </p>
                  <div className="w-full flex justify-center">
                    <Link to="/create-grievance">
                      <button className="flex items-center px-4 py-2 bg-btnColor text-white rounded">
                        <FiFilePlus className="mr-2" size={24} />
                        Create New Grievance
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="pt-10 overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-hide hover:scrollbar-visible">
                {grievances.map((item) => (
                  <GrievancesItem
                    key={item.id}
                    id={item.id}
                    content={item.content}
                    department={item.department}
                    concernedStaffEmail={item.concernedStaffEmail}
                    studentEmail={item.studentEmail} // Pass studentEmail to GrievancesItem
                    createdAt={item.createdAt}
                    isSolved={item.isSolved}
                    upvoteCount={item.upvoteCount}
                    hasUpvoted={item.upvotedUsers ? item.upvotedUsers.includes("currentUserName") : false} // Adjust this based on actual user logic
                    onDelete={handleDeleteGrievance}
                    handleUpvote={() => handleUpvote(item.id)}
                    className="max-w-[800px] w-full mx-auto" // Set width and center it
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AllGrievances;
