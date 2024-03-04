import axios from 'axios';

// http://localhost:1985/
export const fetchRtcV1Publish = ({
  sdp,
  liveStreamName,
}: {
  sdp: string;
  liveStreamName: string;
}) => {
  return axios.post('/api/srs/rtcV1Publish', {
    streamurl: `webrtc://localhost/${liveStreamName}`,
    sdp,
  });
};
