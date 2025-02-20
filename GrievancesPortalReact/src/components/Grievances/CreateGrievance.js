import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { MdAssignment } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import api from "../../services/api"; // Ensure this path is correct
import Buttons from "../../utils/Buttons";
import toast from "react-hot-toast";

const CreateGrievance = () => {
  const navigate = useNavigate();
  const [editorContent, setEditorContent] = useState("");
  const [department, setDepartment] = useState("");
  const [concernedStaffEmail, setConcernedStaffEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (content) => {
    setEditorContent(content);
  };

  const handleSubmit = async () => {
    if (editorContent.trim().length === 0 || !department || !concernedStaffEmail) {
      return toast.error("All fields are required");
    }

    try {
      setLoading(true);
      // Strip HTML tags from the content
      const strippedContent = editorContent.replace(/<[^>]+>/g, '');
      const grievanceData = { content: strippedContent, department, concernedStaffEmail };
      await api.post("/grievances", grievanceData);
      toast.success("Grievance created successfully");
      navigate("/grievances"); // Adjust route as necessary
    } catch (err) {
      console.error(err); // Log the error for debugging
      toast.error("Error creating grievance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-74px)] p-10">
      <div className="flex items-center gap-1 pb-5">
        <h1 className="font-montserrat text-slate-800 sm:text-4xl text-2xl font-semibold">
          Create New Grievance
        </h1>
        <MdAssignment className="text-slate-700 text-4xl" />
      </div>

      <input
        type="text"
        placeholder="Department"
        value={department}
        onChange={(e) => setDepartment(e.target.value)}
        className="mb-4 p-2 border rounded"
      />
      
      <input
        type="text"
        placeholder="Concerned Staff"
        value={concernedStaffEmail}
        onChange={(e) => setConcernedStaffEmail(e.target.value)}
        className="mb-4 p-2 border rounded"
      />

      <div className="h-72 sm:mb-20 lg:mb-14 mb-28">
        <ReactQuill
          className="h-full"
          value={editorContent}
          onChange={handleChange}
          modules={{
            toolbar: [
              [{ header: [1, 2, 3, 4, 5, 6] }],
              [{ size: [] }],
              ["bold", "italic", "underline", "strike", "blockquote"],
              [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
              ["clean"],
            ],
          }}
        />
      </div>

      <Buttons
        disabled={loading}
        onClickhandler={handleSubmit}
        className="bg-customRed text-white px-4 py-2 hover:text-slate-300 rounded-sm"
      >
        {loading ? <span>Loading...</span> : "Create Grievance"}
      </Buttons>
    </div>
  );
};

export default CreateGrievance;
