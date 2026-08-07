import { Lock } from 'lucide-react'
import React from 'react'
import { useSelector } from 'react-redux'

const LockedBar = ({ recordUsers, recordName = '' }) => {
    const { user: currentUser } = useSelector(state => state.user)

    return (
        <div className="sticky top-0 z-40 mb-4 overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100 shadow-lg backdrop-blur">
            <div className="flex items-start justify-between gap-6 p-4">

                <div className="flex items-start gap-3">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md">
                        <Lock size={20} />
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-amber-900">
                            {recordName} Locked
                        </h3>

                        <p className="mt-1 text-sm text-amber-800">
                            This {recordName.toLowerCase()} is currently being handled by another team member.
                            Editing is temporarily disabled to avoid conflicts.
                        </p>
                    </div>

                </div>

                <div className="flex flex-wrap justify-end gap-2">
                    {recordUsers
                        .filter(user => user.email !== currentUser.email)
                        .map(user => (
                            <div
                                key={user.id}
                                className="flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-3 py-2 shadow-sm backdrop-blur"
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-xs font-semibold text-white">
                                    {user.name?.charAt(0)}
                                </div>

                                <div>
                                    <div className="text-sm font-medium text-slate-900">
                                        {user.name}
                                    </div>

                                    <div className="text-xs text-amber-700">
                                        Currently editing
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>

            </div>

            <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500" />
        </div>
    )
}

export default LockedBar