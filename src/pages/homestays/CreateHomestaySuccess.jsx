// src/pages/CreateHomestaySuccess.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const CreateHomestaySuccess = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4 text-center">
            <CheckCircle className="text-green-500 w-20 h-20 mb-6" />
            <h1 className="text-3xl font-bold mb-4">Tạo Homestay thành công!</h1>
            <p className="text-gray-600 mb-6">Bạn đã tạo Homestay mới thành công. Hãy tiếp tục thêm phòng hoặc xem trang quản lý.</p>
            <div className="flex space-x-4">
                <button
                    onClick={() => navigate('/host/homestays')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Về trang quản lý
                </button>
                <button
                    onClick={() => navigate('/host/homestay/create')}
                    className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                    Tạo mới homestay khác
                </button>
            </div>
        </div>
    );
};

export default CreateHomestaySuccess;
