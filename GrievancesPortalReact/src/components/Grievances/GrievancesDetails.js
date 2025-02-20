import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { Blocks } from "react-loader-spinner";
import Errors from "../Errors";
import Buttons from "../../utils/Buttons";
import toast from "react-hot-toast";
import GrievancesItem from "./GrievancesItem"; // Ensure to import GrievancesItem

const GrievancesDetails = () => {
  const { id } = useParams();
  const [grievance, setGrievance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchGrievanceDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/grievances/${id}`);
      setGrievance(response.data);
    } catch (err) {
      setError(err?.response?.data?.message);
      console.error("Error fetching grievance details", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchGrievanceDetails();
  }, [fetchGrievanceDetails]);

  const handleDelete = async () => {
    try {
      await api.delete(`/grievances/${id}`);
      toast.success("Grievance deleted successfully");
      navigate("/grievances");
    } catch (err) {
      toast.error("Error deleting grievance");
    }
  };

  if (error) {
    return <Errors message={error} />;
  }

  return (
    <div className="min-h-[calc(100vh-74px)] md:px-10 md:py-8 sm:px-6 py-4 px-4">
      <div className="py-6 px-8 min-h-customHeight shadow-lg shadow-gray-300 rounded-md">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-96">
            <span>
              <Blocks
                height="70"
                width="70"
                color="#4fa94d"
                ariaLabel="blocks-loading"
                wrapperStyle={{}}
                wrapperClass="blocks-wrapper"
                visible={true}
              />
            </span>
            <span>Please wait...</span>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-semibold">Grievance Details</h1>
            <GrievancesItem
              id={grievance.id}
              content={grievance.content}
              department={grievance.department}
              concernedStaff={grievance.concernedStaff}
              createdAt={grievance.createdAt}
              isSolved={grievance.isSolved}
              onDelete={handleDelete}
              fetchGrievanceDetails={fetchGrievanceDetails} // Pass the function as a prop
            />
            <div className="flex justify-end gap-2 mt-4">
              <Buttons
                onClickhandler={() => navigate(-1)}
                className="bg-btnColor text-white px-3 py-1 rounded-md"
              >
                Go Back
              </Buttons>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GrievancesDetails;
