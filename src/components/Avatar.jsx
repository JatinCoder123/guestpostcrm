import React from 'react'

const Avatar = () => {
  const avatar = {
    "id": "e6059fca-7176-51e2-57ea-6915d55f95ec",
    "name": "guestpostcrm",
    "date_entered": "2025-11-13 12:56:37",
    "date_modified": "2025-11-13 13:09:05",
    "modified_user_id": null,
    "created_by": "",
    "description": null,
    "deleted": "0",
    "assigned_user_id": "",
    "email": "guestpostcrm@gmail.com",
    "avatar_url": "https://errika.guestpostcrm.com/custom/outright_products/Rightee/LogicHooks/avatar_cache/guestpostcrm.mp4",
    "download_url": "https://stttssvcproduse2.blob.core.windows.net/batchsynthesis-output/79fa232a1c894261bbbc0285b05b5d44/job_6915d87f30f379.82189879/0001.mp4"
  }

  return (
    <div className="fixed bottom-10 right-5 z-50 flex items-center gap-3 px-4 py-3  rounded-xl">
  <video
    src={avatar.avatar_url}
    autoPlay
    loop
    muted={false}
    playsInline
    className="w-52 h-52 rounded-full object-cover shadow-2xl border-4 border-white"
    controls
  />
</div>
  );
}




export default Avatar
