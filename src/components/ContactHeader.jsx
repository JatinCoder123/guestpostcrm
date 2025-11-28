import { LoadingAll } from './Loading'
import { useSelector } from 'react-redux'
import { Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import SocialButtons from './SocialButtons'

const ContactHeader = () => {
    const { ladger, email } = useSelector((state) => state.ladger)
    const {
        contactInfo,
        contactLoading,
    } = useSelector((state) => state.viewEmail);

    return (
        <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
                <div className="flex items-center gap-3">
                    {ladger.length > 0 && (
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <Mail className="w-5 h-5 text-gray-600" />
                            </div>
                            {contactLoading ? (
                                <LoadingAll size="30" color="blue" />
                            ) : (
                                <Link
                                    to={"/contacts"}
                                    className="text-gray-800 text-lg font-semibold"
                                >
                                    {contactInfo?.first_name == ""
                                        ? email
                                        : contactInfo?.first_name}
                                </Link>
                            )}

                            <img
                                width="50"
                                height="50"
                                src="https://img.icons8.com/bubbles/100/verified-account.png"
                                alt="verified-account"
                            />
                        </div>
                    )}

                    <div className="ml-4 flex items-center gap-4">
                        {/* TYPE */}
                        <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-2 rounded-md">
                            <div className="text-sm">
                                <div className="text-gray-500 text-xs">Type</div>
                                <div className="h-[2px] my-2 -mx-2 rounded-full bg-gradient-to-r from-blue-400 via-sky-400 to-blue-600"></div>
                                <div className="text-gray-800 font-medium">
                                    {contactInfo?.type ?? "N/A"}
                                </div>
                            </div>
                        </div>

                        <div className="w-px h-10 bg-gray-200"></div>

                        {/* STATUS */}
                        <div className="flex items-center gap-2 bg-purple-50 border border-purple-100 px-3 py-2 rounded-md">
                            <div className="text-sm">
                                <div className="text-gray-500 text-xs">Status</div>
                                <div className="h-[2px] my-2 -mx-2 rounded-full bg-gradient-to-r from-blue-400 via-sky-400 to-blue-600"></div>
                                <div className="text-gray-800 font-medium">
                                    {contactInfo?.status ?? "N/A"}
                                </div>
                            </div>
                        </div>

                        <div className="w-px h-10 bg-gray-200"></div>

                        {/* STAGE */}
                        <div className="flex items-center gap-2 bg-purple-50 border border-purple-100 px-3 py-2 rounded-md">
                            <div className="text-sm">
                                <div className="text-gray-500 text-xs">Stage</div>
                                <div className="h-[2px] my-2 -mx-2 rounded-full bg-gradient-to-r from-blue-400 via-sky-400 to-blue-600"></div>
                                <div className="text-gray-800 font-medium">
                                    {contactInfo?.stage ?? "N/A"}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Social Buttons */}
                <SocialButtons />
            </div>
        </div>
    )
}

export default ContactHeader