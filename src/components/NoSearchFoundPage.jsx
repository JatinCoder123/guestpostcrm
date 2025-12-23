import React, { useContext, useEffect } from 'react'
import { getNoSearchResultData, ladgerAction } from '../store/Slices/ladger';
import { useDispatch, useSelector } from 'react-redux';
import { PageContext } from '../context/pageContext';
import { toast } from 'react-toastify';
import { LoadingChase } from './Loading';
import { Calendar, Import } from 'lucide-react';
export const NoSearchFoundPage = () => {
    const { search } = useContext(PageContext);
    const { noSearchResultData, loading, error } = useSelector((state) => state.ladger);
    const { loading: unrepliedLoading } = useSelector((state) => state.unreplied);
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(getNoSearchResultData(search))
    }, [search])
    useEffect(() => {
        if (error) {
            toast.error(error)
            dispatch(ladgerAction.clearAllErrors())
        }
    }, [error, dispatch])
    if (loading || unrepliedLoading) {
        return <div className='flex justify-center items-center '>
            <LoadingChase />
        </div>
    }
    if (noSearchResultData?.length === 0) {
        return <div className='flex justify-center items-center '>No Search Found</div>
    }
    return (
        <div className="overflow-x-auto">
            <table className="w-full ">
                <thead>
                    <tr className="bg-gradient-to-r from-orange-500 to-yellow-600  text-white">

                        <th className="px-6 py-4 text-left" >
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />

                                DATE

                            </div>
                        </th>
                        <th className="px-6 py-4 text-left">EMAIL</th>
                        <th className="px-6 py-4 text-left">
                            SUBJECT
                        </th>
                        <th className="px-6 py-4 text-left">ACTIONS</th>
                    </tr>
                </thead>

                <tbody>
                    {noSearchResultData?.map((item, index) => (
                        <tr
                            key={index}
                            className="border-b border-gray-100 hover:bg-pink-50 transition"
                        >
                            <td className="px-6 py-4 text-gray-600">{item.date_created}</td>
                            <td className="px-6 py-4">{item.customer_email}</td>
                            <td className="px-6 py-4 text-blue-600">{item.subject}</td>


                            <td className="pl-9 py-4">


                                <div className="flex items-center justify-center gap-2">
                                    {/* Update Button */}
                                    <button
                                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                                        onClick={() => alert("Work in progress")}
                                    >
                                        <Import className="w-5 h-5 text-blue-600" />
                                    </button>

                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>

            </table>
        </div>
    )
}
