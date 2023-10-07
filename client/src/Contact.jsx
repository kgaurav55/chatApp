import Avatar from "./Avatar.jsx";        
export default function Contact({id,username,onClick,selected,online,messageCount,recentMessage,typing}) 
{   
   return(
    <div key={id} onClick={() => onClick(id)} className={"border-b border-gray-100 flex items-center gap-2 cursor-pointer " + (selected ? 'bg-blue-50' : '')}>
    {selected && (
      <div className="w-1 bg-blue-500 h-12 rounded-r-md"></div>
    )}
    <div className="flex gap-1 py-1 pl-4 items-center ">
      <Avatar online={online} username={username} userId={id} />
      <div className="items-center ml-4 mt-5  ">
        <div className="text-gray-800">{username}</div>
        <div className="relative h-5">
          {typing ? (
              <div className="absolute">
              <div className="text-green-400 text-sm mt-1 ml-0 h-1">Typing...</div>
            </div>
           // <div className="text-green-400 text-sm mt-1">Typing...</div>
           //   <div className=" ml-0 w-1 h-1 rounded-full bg-white animate-bounce mx-1 text-green-400 text-sm mt-1">Typing...</div>
          ) : (
            recentMessage && !selected && (
              <div className="text-gray-600 text-sm mt-1">{recentMessage}</div>
            )
          )}
        </div>
      </div>
    </div>
    {messageCount > 0 && !selected && (
      <div className="flex items-center ml-40">
        <div className="w-3 h-3 bg-green-400 rounded-full border border-white"></div>
        <span className="text-green-400 ml-1">{messageCount}</span>
      </div>
    )}
  </div>
   );
}



  /*return (
    <div key={id} onClick={() => onClick(id)}
         className={"border-b border-gray-100 flex items-center gap-2 cursor-pointer "+(selected ? 'bg-blue-50' : '')}>
      {selected && (
        <div className="w-1 bg-blue-500 h-12 rounded-r-md"></div>
      )}
      <div className="flex gap-2 py-2 pl-4 items-center">
        <Avatar online={online} username={username} userId={id} />

        <span className="text-gray-800">{username}</span>
        {messageCount > 0 && (
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-400 rounded-full border border-white"></div>
              <span className="text-green-400 ml-1">{messageCount}</span>
            </div>
          )}
          {recentMessage && (
            <div className="text-gray-600 text-sm">{recentMessage}</div>
          )}


      </div>
    </div>
  );
} */



/*<div>
<div key={id} onClick={() => onClick(id)} className={"border-b border-gray-100 flex items-center gap-2 cursor-pointer " + (selected ? 'bg-blue-50' : '')}>
{selected && (
  <div className="w-1 bg-blue-500 h-12 rounded-r-md"></div>
)}
<div className="flex gap-1 py-1 pl-4 items-center">
  <Avatar online={online} username={username} userId={id} />
  <div className="items-center ml-4 mt-1">
    <div className="text-gray-800">{username}</div>
    <div>
      {typing ? (
        <div className="text-green-400 text-sm mt-1">Typing...</div>
      ) : (
        recentMessage && !selected && (
          <div className="text-gray-600 text-sm mt-1">{recentMessage}</div>
        )
      )}
    </div>
  </div>
</div>
{messageCount > 0 && !selected && (
  <div className="flex items-center ml-40">
    <div className="w-3 h-3 bg-green-400 rounded-full border border-white"></div>
    <span className="text-green-400 ml-1">{messageCount}</span>
  </div>
)}
</div>
</div>  */



