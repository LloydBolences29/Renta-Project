// import { useEffect, useState } from "react";
// import io from "socket.io-client";
// import { Pets as PetIcon } from "@mui/icons-material";
// import { List, ListItem, ListItemIcon, ListItemText, Paper } from "@mui/material";

// const socket = io("http://localhost:5000");

// const AdminNotifications = ({ adminId }) => {
//   const [notifications, setNotifications] = useState([]);

//   useEffect(() => {
//     fetch(`/api/notifications/${adminId}`)
//       .then((res) => res.json())
//       .then((data) => setNotifications(Array.isArray(data) ? data : []));

//     // Subscribe admin to WebSocket updates
//     socket.emit("subscribe", adminId);
//     socket.on("new-notification", (notification) => {
//       setNotifications((prev) => [notification, ...prev]);
//     });

//     return () => {
//       socket.disconnect();
//     };
//   }, [adminId]);

//   return (
//     <Paper elevation={3} sx={{ maxWidth: 400, mx: "auto", p: 2 }}>
//       <h2 className="text-xl font-bold mb-4 flex items-center">
//         <PetIcon className="mr-2" /> Pet Notifications
//       </h2>
//       <List>
//         {notifications.map((notif) => (
//           <ListItem key={notif._id} button>
//             <ListItemIcon><PetIcon color="primary" /></ListItemIcon>
//             <ListItemText primary={notif.title} secondary={notif.message} />
//           </ListItem>
//         ))}
//       </List>
//     </Paper>
//   );
// };

// export default AdminNotifications;
