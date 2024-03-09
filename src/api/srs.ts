import axios from 'axios';

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
