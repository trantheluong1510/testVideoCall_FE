import { Mic, MicOff, Video, VideoOff, X } from 'lucide-react'

const ParticipantList = ({ participants, localParticipant, onClose }) => {
  const renderParticipantInfo = (participant, isLocal = false) => {
    const isMicEnabled = participant.isMicrophoneEnabled
    const isCameraEnabled = participant.isCameraEnabled

    return (
      <div className="flex items-center justify-between bg-gray-700 rounded-lg p-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">
              {participant.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <p className="text-white font-medium">
              {participant.name} {isLocal && '(You)'}
            </p>
            <div className="flex items-center gap-2 mt-1">
              {isMicEnabled ? (
                <Mic className="w-4 h-4 text-green-400" />
              ) : (
                <MicOff className="w-4 h-4 text-red-400" />
              )}
              {isCameraEnabled ? (
                <Video className="w-4 h-4 text-green-400" />
              ) : (
                <VideoOff className="w-4 h-4 text-red-400" />
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-gray-800 shadow-2xl flex flex-col">
      <div className="bg-gray-700 px-4 py-3 flex items-center justify-between">
        <h3 className="text-white font-semibold">
          Participants ({participants.length + 1})
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-3">
        {localParticipant && renderParticipantInfo(localParticipant, true)}
        {participants.map(participant => renderParticipantInfo(participant))}
      </div>
    </div>
  )
}

export default ParticipantList
