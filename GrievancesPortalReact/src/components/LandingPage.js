import React, { useEffect, useState } from "react";
import GrievancesItem from "./Grievances/GrievancesItem"; // Ensure the correct path to GrievancesItem
import api from "../services/api"; // Ensure the correct path to your API service
import { Blocks } from "react-loader-spinner";
import Buttons from "../utils/Buttons"; // Import your button component
import { Link } from "react-router-dom";
import { useMyContext } from "../store/ContextApi"; // Import context to access user state
import { motion } from "framer-motion"; // For animations
import toast from "react-hot-toast"; // For notifications

const LandingPage = () => {
  const { token, userName } = useMyContext(); // Get token and username from context
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // State to manage error

  // Fetch all grievances
  const fetchGrievances = async () => {
    setLoading(true);
    setError(null); // Reset error state before fetching
    try {
      const response = await api.get("/grievances/all"); // Fetch all grievances
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
  };

  // Handle deletion of a grievance
  const handleDeleteGrievance = async (id) => {
    setGrievances((prevGrievances) =>
      prevGrievances.filter((grievance) => grievance.id !== id)
    );
    try {
      await api.delete(`/grievances/${id}`); // Call API to delete grievance
    } catch (error) {
      console.error("Failed to delete grievance:", error);
      toast.error("Failed to delete grievance."); // Notify user of error
      fetchGrievances(); // Re-fetch grievances to restore state
    }
  };

  // Fetch grievances when component mounts or when token changes
  useEffect(() => {
    if (token) {
      fetchGrievances();
    }
  }, [token]);

  return (
    <div className="min-h-[calc(100vh-74px)] flex flex-col items-center justify-center">
      {token ? (
        loading ? (
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
        ) : grievances.length > 0 ? (
          <div className="w-full max-w-4xl px-4">
            <h1 className="font-montserrat text-slate-800 sm:text-4xl text-2xl font-semibold text-center my-6">All Grievances</h1>
            {grievances.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ duration: 0.3 }}
              >
                <GrievancesItem
                  id={item.id}
                  content={item.content}
                  department={item.department}
                  concernedStaffEmail={item.concernedStaffEmail}
                  createdAt={item.createdAt}
                  isSolved={item.isSolved}
                  onDelete={handleDeleteGrievance}
                  fetchGrievances={fetchGrievances}
                  upvoteCount={item.upvoteCount}
                  hasUpvoted={item.upvotedUsers ? item.upvotedUsers.includes(userName) : false}
                  studentEmail={item.studentEmail} // Pass the student email here
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <h2 className="text-2xl font-bold text-gray-800">
            No grievances available.
          </h2>
        )
      ) : (
        <div className="lg:w-[80%] w-full py-16 space-y-4 transition-transform duration-300 ease-in-out transform hover:scale-105">
          <motion.h1
            className="font-montserrat uppercase text-headerColor xl:text-headerText md:text-4xl text-2xl mx-auto text-center font-bold sm:w-[95%] w-full"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Grievances Portal BIT
          </motion.h1>
          <motion.p
            className="text-gray-600 text-lg text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Submit your concerns easily and efficiently!
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center justify-center gap-3 py-10"
          >
            <Link to="/login">
              <Buttons className="sm:w-52 w-44 bg-customRed font-semibold transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg cursor-pointer text-white px-10 py-3 rounded-sm transform hover:translate-y-[-3px]">
                Sign In
              </Buttons>
            </Link>
            <Link to="/signup">
              <Buttons className="sm:w-52 w-44 bg-btnColor font-semibold transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg cursor-pointer text-white px-10 py-3 rounded-sm transform hover:translate-y-[-3px]">
                Sign Up
              </Buttons>
            </Link>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
