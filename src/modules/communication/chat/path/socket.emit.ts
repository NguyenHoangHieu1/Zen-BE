export const enum socketEmit {
  sendMessage = 'sendMessage',
  seenMessage = 'seenMessage',
  activeList = 'activeList',
  askSetToLocal = 'askSetToLocal',
  deleteMessage = 'deleteMessage',
  changeMessage = 'changeMessage',
  //for call
  requestCancel = 'requestCancel',
  requestDeny = 'requestDeny',
  requestAccept = 'requestAccept',
  callMessageFromPeer = 'callMessageFromPeer',
  memberLeft = 'memberLeft',
}
