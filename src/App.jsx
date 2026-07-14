import { useState } from 'react'
import Lobby from './components/Lobby'
import VideoRoom from './components/VideoRoom'

function App() {
  const [roomData, setRoomData] = useState(null)

  const handleJoinRoom = (data) => {
    setRoomData(data)
  }

  const handleLeaveRoom = () => {
    setRoomData(null)
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {roomData ? (
        <VideoRoom 
          roomName={roomData.roomName}
          token={roomData.token}
          url={roomData.url}
          participantName={roomData.participantName}
          onLeave={handleLeaveRoom}
        />
      ) : (
        <Lobby onJoin={handleJoinRoom} />
      )}
    </div>
  )
}

export default App
