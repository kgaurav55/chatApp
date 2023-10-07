import {useContext, useEffect, useRef, useState,useLayoutEffect} from "react";
import Avatar from "./Avatar";
import Logo from "./Logo";
import {UserContext} from "./UserContext.jsx";
import {uniqBy} from "lodash";
import axios from "axios";
import Contact from "./Contact";    
// these are the state variables okay 
 export default function Chat() {
  const [ws,setWs] = useState(null);
  const [onlinePeople,setOnlinePeople] = useState({});
  const [offlinePeople,setOfflinePeople] = useState({});
  const [selectedUserId,setSelectedUserId] = useState(null);
  const [newMessageText,setNewMessageText] = useState('');
  const [messages,setMessages] = useState([]);
  // on the very login you will have your username and ID in these parameters 
  const {username,id,setId,setUsername} = useContext(UserContext);
  const wsRef = useRef(null);
  const messagesRef = useRef(messages);
  //const [incomingMessages, setIncomingMessages] = useState({});
  const [contacts, setContacts] = useState({});
  const [x,setx]=useState(0);
  const [istyping,setistyping]=useState(false);
  const[typeid,settypeid]= useState(null);
   

const [page, setPage] = useState(1);
const pageRef=useRef(1);
const pageSize = 10; // Adjust this as needed
const [loading, setLoading] = useState(false);
const messageContainerRef=useRef(null);
const loadRef= useRef(false);
let typingTimeout;
 // console.log(contacts);
 // console.log("showing offline people");
 // console.log(offlinePeople);
 // const username= null;
  //const id= null;
  //const setId= null;
  //const setUsername= null;
  const divUnderMessages = useRef();
  /*useEffect(() => {
    setIncomingMessages((prev)=>{
      return  {...prev, 3:{count: 1, mostRecentMessage: "hi"}}
    })
  }, []); */
  const selectRef=useRef(selectedUserId);
  selectRef.current=selectedUserId;
  console.log("page count ");
  console.log(page);
  console.log("new message text")
  console.log(newMessageText);
  console.log("XXXXX");
  console.log(x);
  console.log("here, messages")
  console.log(messages);
  console.log("here Message Ref messagesn")
  console.log(messagesRef.current);
  console.log("here is the list of contacts");
  console.log(contacts);
   console.log("connected to user ");
   console.log(selectedUserId);
   console.log("showing current connection");
   console.log(ws);
   // this function will mark all the unread messages to read in the database 
   /*function openChat(){
     // doing something 
      console.log("outside open chat");
     const recipientUserId=selectedUserId;
     // this is a old connection that we using this connection is already been closed
     if(ws)
     {
       console.log("inside openchat");
       ws.send(JSON.stringify({
       event: 'openChat', // Custom event name
       recipient: recipientUserId, // Recipient's user ID


     }));  
     } 
     else
     {
        console.log("WS IS NULL");
       
     }  
   } */
   // this approach won't work for for stop the typing message  the message 
   // get all the unread messages from database from intitial render 
  /* useEffect(()=>{
      //have to send the request to the websocket about the person is typing 
      console.log("inside typing")
      console.log(wsRef.current);
      if(wsRef.current)
      {
      wsRef.current.send(JSON.stringify({
        event: 'typing',
        recipient: selectedUserId,
      }));  
    } 
   },[newMessageText]) */
   useEffect(()=>{
    console.log("inside unread");
    async function fetchUnreadMessages() {
        console.log("getting unread messages ")
        const response = await axios.get('/unread');
        const { messages } = response.data;
        console.log("hiiiiiiiiiiiiiiii");
        console.log("here are your unread messages");
        console.log(messages);
        console.log("hiiiiiiiiiiiiiiii");
      //  messages.forEach((messageData)=>{

         /* setContacts((prevContacts) =>{
            ...prevContacts,
            [messageData.sender]: {
              messageCount: (prevContacts[messageData.sender]?.messageCount ||0) + 1,
              recentMessage: messageData.text,
            },
          });// end of state update */

          messages.forEach((messageData) => {
            console.log("Updating contacts for sender", messageData.sender); });

          messages.forEach((messageData) => {
            if(messageData.recipient===id)
            {
            setContacts((prevContacts) => ({
              ...prevContacts,
              [messageData.sender]: {
                messageCount: (prevContacts[messageData.sender]?.messageCount || 0) + 1,
                recentMessage: messageData.text,
              },
            }));
          }
          });
       // });// end of for loop

       console.log("IN");
       console.log(contacts);
    }  
        // Update the state with the fetched unread messages
       // setUnreadMessages(messages);
  
    // Call the async function to fetch unread messages
    fetchUnreadMessages(); // Empty dependency array ensures this runs only once

   }// end of async function
    ,[])//end of useEffect 
    useEffect(()=>{

      setMessages([]);
      messagesRef.current=[];
      setPage(1);

    },[selectedUserId])

   async function openChat() {

    console.log("outside open chat");
    const recipientUserId = selectedUserId;
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
         // If there's no open connection, establish a new one
    connectToWs();
    console.log("back in open chat");
    console.log("here showing new connection ")
    console.log(wsRef.current.readyState);
    console.log(wsRef.current);
  
    }
       
    while (wsRef.current && wsRef.current.readyState !== WebSocket.OPEN) {
      // If the connection is not open, wait for a short period (e.g., 100ms)
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    console.log("i'm in async");
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log("inside openchat");
      wsRef.current.send(JSON.stringify({
        event: 'openChat',
        recipient: recipientUserId,
      }));
    }
  }
   // wheh the user selected any chat fire a websocket event 
  /*useEffect(()=>{
    console.log("inside openchat useeffect");
     if(selectedUserId && ws)
      {
        openChat();
      }  
  }  
 ,[selectedUserId]); */

   useEffect(()=>{
      // console.log("inside connect ws useffect");
      // connectToWs();
     
       return () => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {

          console.log("clozzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzing")
          wsRef.current.close(); // Close the WebSocket connection if it's open
         // setx(1);
        }
      };
  }
    ,[selectedUserId]); 
  async function connectToWs() 
   {
    console.log("inside connect ws");  
    // if (ws && ws.readyState === WebSocket.OPEN) {
    // ws.close(); // Close the WebSocket connection if it's open
    //}
    setx(1);
    const ws =  new WebSocket('wss://chat3-ubif.onrender.com'); 
    wsRef.current = ws;
    setWs(ws); // Set the WebSocket instance in the ref
  
  //  console.log("no.of connections");
   // console.log(ws);
   // setWs(ws);
    ws.addEventListener('message', handleMessage);
      /* ws.addEventListener('close', () => {
      setTimeout(() => {
        console.log('Disconnected. Trying to reconnect.');
        connectToWs();
      }, 1000); */
  }
  useEffect(() => {
    console.log("inside openchat useeffect");
   // if(!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
     // console.log("opening for the fisrt time")
      // Only create a new WebSocket connection if there isn't an existing open connection
     // connectToWs();
    //}
    if(x===0)
     {
      connectToWs();
     }
      if (selectedUserId  ) {
        console.log("isnside xxxxxxx")
        openChat();
          }

  }, [selectedUserId]);
  function showOnlinePeople(peopleArray) {
    console.log("showing online people ")
    const people = {};
    peopleArray.forEach(({userId,username}) => {
      people[userId] = username;
    });
    setOnlinePeople(people);
  }  
  function markSeen({senderid})
  {
        // Create a new array with modified message statuses
        console.log("inside Markseen");
        //console.log(messages);
  const updatedMessages = messagesRef.current.map((message) => {
    // Check if the message is from user B and if it's unread
    if (message.sender === id && message.recipient===senderid && !message.read) {
      // Mark the message as "Seen"
      return {
        ...message,
        read: true,
      };
    }
    // Leave other messages unchanged
    return message;
  });
  console.log("updated setmessages");
  console.log(updatedMessages);
  messagesRef.current=updatedMessages;
  setMessages(updatedMessages);
  }
// handelling the incomming message from the websockets   
  function handleMessage(ev) {
    console.log("showing ev"+ev);
    // when you recieve the message notification saying true 
    // do something like blue tick and all 
      console.log(ev);
     console.log("inside handlemessage"); 
     // console.log(messages);
      console.log(messagesRef.current); 

      console.log(selectedUserId);
      console.log(selectedUserId);
    const messageData = JSON.parse(ev.data);
      if(messageData.messagesRead)
       {
            
          console.log("Inside MessageRead");
          const senderid=messageData.sender;
           markSeen({senderid});
       }
       if(messageData.typing)
       {
        console.log("Inside typing ");
          //typing();
          setistyping(true);
          settypeid(messageData.sender);
       }
       if(messageData.typing==false)
       {
          //console.log("Inside typing ");
          setistyping(false);
          settypeid(messageData.sender);
       }
       
    console.log({ev,messageData});
    if ('online' in messageData) {
      showOnlinePeople(messageData.online);
    } else if ('text' in messageData) {
         console.log("selected user Id");
         console.log(selectedUserId);
         if (messageData.sender === selectedUserId) {
            console.log("am i entring into this ");
            console.log(messages);
            messagesRef.current=[{...messageData}, ...messagesRef.current];
            setMessages(prev => {
              console.log(prev);
              const newState = [{...messageData},...prev];
            
             // console.log(newState); // Log the new state
              return newState; // Return the new state
            });

            // over here i'm recieving live message that means i have to notify the user 
            // about his message that i have read the message 
            wsRef.current.send(JSON.stringify({
              event: 'openChat',
              recipient: selectedUserId,
            }));

          }

           else{

            setContacts(prevContacts => ({
              ...prevContacts,
              [messageData.sender]: {
                messageCount: (prevContacts[messageData.sender]?.messageCount ||0) + 1,
                recentMessage: messageData.text,
              },
            }));
           }
      // here we are recieving the message from some other user which is not selected 
      // by us for chat right say from user C which means definitly user C is online 
      // and now i want to put send the notification to the user A 

       //console.log("incomming message when chat window is not opened");
       //console.log(messageData);    
              /*{
                setIncomingMessages((prev) => {
                const senderId = messageData.sender;
                const existingData= prev[senderId] || {count:0, mostRecentMessage: null} ;
                 
                const update={
                  ...prev,
                  [senderId] :
                   { 
                     count: existingData.count+1,
                     mostRecentMessage: messageData,

                   }
                }
                return update;
          }); */
  }
}
  function logout() {
    axios.post('/logout').then(() => {
      setWs(null);
      setId(null);
      setUsername(null);
    });
  }
// this is for sending the message from chat box  
  function sendMessage(ev, file = null) {
    if (ev) ev.preventDefault();

    const trimmedMessageText = newMessageText.trim();
    //this is trimming the message extra white spaces from the front and the back
    if (trimmedMessageText !== '')
  {
    ws.send(JSON.stringify({
      recipient: selectedUserId,
      text: newMessageText,
      file,
    }));
    // not used as of now 
    if (file) {
      axios.get('/messages/'+selectedUserId).then(res => {
        setMessages(res.data);
      });
    } else {
      setNewMessageText('');
      const newmess= {
        text: newMessageText,
        sender: id,
        recipient: selectedUserId,
        createdAt: new Date().toISOString(),
        _id: Date.now(),
        read:false,
        exist:"local"
      };
      setMessages(prev => ([{
        text: newMessageText,
        sender: id,
        recipient: selectedUserId,
        createdAt: new Date().toISOString(),
        _id: Date.now(),
        read:false,
        exist:"local"
      },...prev]));
   //   setcount((prev)=>{
     //    return 1+prev;
     // })
    messagesRef.current= [newmess, ...messagesRef.current];
     console.log("showing new Message Ref")
       console.log(messagesRef.current);

    }
  }
} 

 // as of now this functionality is closed 
  function sendFile(ev) {
    const x=0;
    if(x)
    {
    const reader = new FileReader();
    reader.readAsDataURL(ev.target.files[0]);
    reader.onload = () => {
      sendMessage(null, {
        name: ev.target.files[0].name,
        data: reader.result,
      });
    };
  } 

  }
// scrolling thing 
  useEffect(() => {
    console.log("inside scroll ");
    const div = divUnderMessages.current;
    if (div) {
      div.scrollIntoView({behavior:'smooth', block:'end'});
    }
  }, [messages]); 
////

  const loadMoreMessages = () => {
    console.log("LOAD...............");
    //if (loading) return; // Prevent multiple requests while loading
    if(loadRef.current)
      {return;}

   // setLoading(true);
   console.log("page size"+pageRef.current);
    axios.get(`/messages/${selectRef.current}?page=${pageRef.current}&pageSize=${pageSize}`)
      .then((res) => {
        messagesRef.current = [...messagesRef.current,...res.data];
        const newMessages = res.data; 
        setMessages((prevMessages) => [...prevMessages, ...newMessages]);
        setPage((prevPage) =>{
        pageRef.current=prevPage+1;  
        return prevPage + 1
        });
       // setLoading(false);
       loadRef.current=false;
      })
      .catch((error) => {
        // Handle error
        console.error(error);
       // setLoading(false);
       loadRef.current=false;
      });
  };
  const loadInitialMessages = () => {
    // Prevent multiple requests while loading
   // setLoading(true);
   console.log("LOAD INITIAL.....")
   loadRef.current=true;
   console.log("page size"+pageRef.current);
    axios.get(`/messages/${selectRef.current}?page=${pageRef.current}&pageSize=${pageSize}`)
      .then((res) => {

        console.log("insiside inititial LOG")
        console.log("messages"+messages);
        console.log("message ref"+messagesRef.current);

        console.log("upcomming messages"+res.data);

        messagesRef.current = [...res.data];
        console.log("after"+messagesRef.current);
        const newMessages = res.data; 
       // setMessages((prevMessages) => [...newMessages]);
        if(newMessages)
         {
           setMessages(newMessages);
         }
         else
         {
         setMessages([]);
         } 

        setPage((prevPage) =>{
        pageRef.current=prevPage+1;  
        loadRef.current=false;
        return prevPage + 1
        });
      
      })
      .catch((error) => {
        // Handle error
        console.error(error);
      
      });
  };
  let isScrolling = false;
  useEffect(() => {
    const messageContainer = messageContainerRef.current;
    let prevScrollTop = 0; 
    const handleScroll = () => {
     console.log("inside scroll up");
      console.log("prev scroll value"+messageContainer.scrollTop);
      if (messageContainer.scrollTop === 0 && !isScrolling) {
          isScrolling=true;
        // User scrolled to the top, load older messages
       //  prevScrollTop = messageContainer.scrollTop ; 
        // console.log("prev scroll value"+prevScrollTop);
         loadMoreMessages()
          // After loading more messages, reset the scrollTop to the top
         // messageContainer.scrollTop =160;
        setTimeout(()=>{
          console.log("messageContainerRef.current.scrollToppppp"+messageContainerRef.current.scrollTop);
          messageContainerRef.current.scrollTop = 200; 
          isScrolling=false;   
         },1000)
    
        //  messageContainerRef.current.scrollTop = 150;
         // console.log("messageContainerRef.current.scrollTop"+messageContainerRef.current.scrollTop);
      }
    };
    if(messageContainer)
    {
    messageContainer.addEventListener('scroll', handleScroll);
    console.log("initializing scroll container ");
    }
  
    return () => {
      if(messageContainer)
      {
      messageContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, [messageContainerRef.current]);
  /*useEffect(() => {
    console.log("inside scroll ");
    const chatContainer = divUnderMessages.current;

    if (chatContainer) {
      chatContainer.scrollIntoView({behavior:'smooth', block:'end'});
    }
    console.log("showing chat container ")
    console.log(chatContainer);
    const handleScroll = () => {
    console.log("inside scroll handler");
      if (chatContainer) {

        const { scrollTop, clientHeight, scrollHeight } = chatContainer;
        console.log("scrolltop"+scrollTop);
        console.log("scrollheight"+scrollHeight);
        console.log("clientheight"+clientHeight);
        if (scrollTop + clientHeight >= scrollHeight - 10) {
          // You can adjust the threshold (10) as needed to control when to load more messages.
          loadMoreMessages();
        }

      }
    };              
    if(chatContainer)
    {
      console.log("inside if");
    window.addEventListener("scroll", handleScroll);
    } 
    return () => {
      if(chatContainer)
      {
      window.removeEventListener("scroll", handleScroll);
      }
    };
  }, [messages, loadMoreMessages]); */
// getting offline and online users... w'll get to it soon 



  useEffect(() => {
    console.log("inside people");
    axios.get('/people').then(res => {
      const offlinePeopleArr = res.data
        .filter(p => p._id !== id)
        .filter(p => !Object.keys(onlinePeople).includes(p._id));
      const offlinePeople = {};
      offlinePeopleArr.forEach(p => {
        offlinePeople[p._id] = p;
      });
      setOfflinePeople(offlinePeople);
    });
  }, [onlinePeople]);
// this is retrivieng the messages to the particular selected id and opnes up the 
// chat window for it 


  /*useEffect(() => {
    console.log("select user id");
    if (selectedUserId) {
      axios.get('/messages/'+selectedUserId).then(res => {
        messagesRef.current = res.data;
        setMessages(res.data);
         console.log(res.data)});
    }
  }, [selectedUserId]); */

  useEffect(() => {
     console.log("select user id");
     pageRef.current=1;
     setPage(1); // Reset page when selectedUserId changes
     setMessages([]); // Clear previous messages
     messagesRef.current=[];
     loadRef.current=false;
     selectRef.current=selectedUserId;

   //setLoading(false); // Reset loading state
  //the above state changes are of no use 
  // because we are using a lot of asyncrhous operatin in the aplication 
  // that's why we are using such things
    if (selectedUserId) {
      loadInitialMessages();
    }
  }, [selectedUserId]);

   // this is extracting out the online useres except you 
  const onlinePeopleExclOurUser = {...onlinePeople};
  delete onlinePeopleExclOurUser[id];

  //const messagesWithoutDupes = uniqBy(messages, '_id');
  const messagesWithoutDupes = messages;
  const  handleclick=()=>{
    setSelectedUserId(null);
    setx(0);
  }
  const xx="trial";
 const handlechange= (ev)=>{
  setNewMessageText(ev.target.value);
  }
    const handlekeydown=(ev)=>{
    console.log("inside handelkeydoen");
    clearTimeout(typingTimeout);
    // Set a new timeout to send "stop typing" after 2 seconds (adjust as needed)
    typingTimeout = setTimeout(() => {
    //  setIsTyping(false);
      // Send "stop typing" event to the WebSocket server
      if (wsRef.current) {
        console.log("stop typing");
        wsRef.current.send(JSON.stringify({
          event: 'stopTyping',
          recipient: selectedUserId,
        }));
      }
    },2000); // Adjust the delay time as needed

    if (wsRef.current) {
      console.log("start typing");
      wsRef.current.send(JSON.stringify({
        event: 'startTyping',
        recipient: selectedUserId,
      }));
    }

  };
  useEffect(() => {
    return () => {
      // Clear the timeout when the component unmounts
      clearTimeout(typingTimeout);
    };
  }, []);

  const formatTimestamp = (timestamp) => {
    const currentDate = new Date();
    const messageDate = new Date(timestamp);

    if (currentDate.toDateString() === messageDate.toDateString()) {
      return 'Today';
    } else if (
      currentDate.getDate() - messageDate.getDate() === 1 &&
      currentDate.getMonth() === messageDate.getMonth() &&
      currentDate.getFullYear() === messageDate.getFullYear()
    ) {
      return 'Yesterday';
    } else {
      // Customize date formatting as needed
      return messageDate.toLocaleDateString(); // Display the full date
    }
  };
  ///messages.sort((a, b) => b.createdAt - a.createdAt)
  console.log("showing sorted messages ")
  console.log(messages);
  // why this line because on recieving the message from the server on chatting live 
  // message ref is not updated with that message 
  // and that new message is upadted by our state and later on we are updating
  // our message ref here 
  if(messages)
  {
    messagesRef.current=messages;
  }
  messagesRef.current=messages;
 //messages.sort({createdAt:-1});
  return (
<div className="flex h-screen">
      <div className="bg-white w-1/3 flex flex-col">
        <div className="flex-grow">
          <Logo click={ ()=>{
      setSelectedUserId(null);
      setx(0);
      }}/>
         <div className="max-h-[calc(93vh-64px)] overflow-y-auto ">
          {Object.keys(onlinePeopleExclOurUser).map(userId => (
            <Contact
              key={userId}
              id={userId}
              online={true}
              username={onlinePeopleExclOurUser[userId]}
              onClick={() => {setSelectedUserId(userId);console.log({userId})
              // Create a copy of the contacts object without the specified user ID
                const updatedContacts = { ...contacts };
                delete updatedContacts[userId];
                setContacts(updatedContacts);
                   }}
              selected={userId === selectedUserId} 
              messageCount={contacts[userId]?.messageCount || 0}
              recentMessage={contacts[userId]?.recentMessage || ''} 
              typing ={istyping && typeid===userId} />
            
          ))}
          {Object.keys(offlinePeople).map(userId => (
            <Contact
              key={userId}
              id={userId}
              online={false}
              username={offlinePeople[userId].username}
              onClick={() =>{ setSelectedUserId(userId)
                // Create a copy of the contacts object without the specified user ID
                const updatedContacts = { ...contacts };
                delete updatedContacts[userId];
                setContacts(updatedContacts);
              
              }}
              selected={userId === selectedUserId}
              messageCount={contacts[userId]?.messageCount || 0}
              recentMessage={contacts[userId]?.recentMessage || ''}
              typing={false} />      
          ))}
            </div>
        </div>
        <div className="p-3 text-center flex items-center justify-center bg-gray-900 absolute bottom-0 w-1/3">
          <span className="mr-5 text-sm text-white flex items-center ">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
            </svg>
            {username}
          </span>
          <button
            onClick={logout}
            className="text-sm bg-blue-100 py-1 px-2 text-white border rounded-sm bg-blue-900">logout</button>
        </div>
      </div>
      <div className="flex flex-col bg-blue-50 w-2/3 p-2">
        <div className="flex-grow">
          {!selectedUserId && (
            <div className="flex h-full flex-grow items-center justify-center">
              <div className="text-gray-300">&larr; Select a person from the sidebar</div>
            </div>
          )}
       
       {!!selectedUserId &&  (
          
           //  { messages.sort({createdAt:-1})
            <div className="relative h-full border-gray-900 bg-white">
              <div className="overflow-y-scroll absolute top-0 left-0 right-0 bottom-2" ref={messageContainerRef}>
                {  //messages.sort({createdAt:-1})
                
                 messagesRef.current.map((messagee, index) => {
                  const x= messages.length - 1 - index;
                  const message= messages[x];
                  // Check if this message has a different date from the previous one
                  const isDifferentDate =
                     x===messages.length - 1||
                    formatTimestamp(messages[x].createdAt) !==
                      formatTimestamp(messages[x+1].createdAt);


                      const createdAtString = message.createdAt;
                      const createdAtDate = new Date(createdAtString);
                      // Format the date to hh:mm
                      const formattedCreatedAt = `${createdAtDate.getHours()}:${createdAtDate.getMinutes()}`;
        
                  return (
                    <div key={message._id}>
                      {isDifferentDate && (
                        <div className="flex items-center justify-center">
                        <div className="text-center  text-gray-400 rounded-lg  p-1 mt-2 mb-1 ml-39 mr-39 w-20 bg-black">
                         {formatTimestamp(message.createdAt)}
                        </div>
                        </div>

                       // <div className="bg-gray-300 text-gray-700 rounded-lg p-2 mt-2 mb-1">
                        //<div className="text-center">
                         // {date}
                       // </div>
                      )}
                  
                  <div key={message._id} className={(message.sender === id ? 'text-right' : 'text-left')}>
                <div className={"text-left inline-block p-2 my-2 rounded-md text-sm " + (message.sender === id ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black-900')}>
                  <div className="flex flex-col">
                    <div className="max-w-xs md:max-w-md overflow-hidden">
                      <div className="whitespace-normal break-words">
                        {message.text}
                      </div>
                    </div>
                    <div className={`text-xs text-neutral-800  mt-1 ml-auto flex justify-end items-center `}>
                      {formattedCreatedAt}
                      <span className={`ml-1 ${message.sender === id ? (message.read ? 'text-green-400 font-bold' : 'text-red-500 font-bold') : ''}`}>
                        { message.sender === id ? (message.read ? '✓✓' : '✓') : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
                    </div>
                  );
                })}
                <div ref={divUnderMessages}>  </div>

              </div>
            </div>
             
       )}

        </div>
        {!!selectedUserId && (
          <form className="flex gap-2" onSubmit={sendMessage}>
            <input type="text"
                   value={newMessageText}
                  // onChange={ev => setNewMessageText(ev.target.value)}
                   onChange={handlechange}
                   onKeyDown={handlekeydown}
                   placeholder="Type your message here"
                   className="bg-white flex-grow border rounded-sm p-2"/>
            <label className="bg-blue-200 p-2 text-gray-600 cursor-pointer rounded-sm border border-blue-200">
              <input type="file" className="hidden" onChange={sendFile} /> 
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068L18.97 6.84a2.25 2.25 0 000-3.182z" clipRule="evenodd" />
              </svg>
            </label>
            <button type="submit" className="bg-blue-500 p-2 text-white rounded-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </form>
        )}
     </div>
    </div>
  );
}
