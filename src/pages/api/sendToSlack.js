import axios from 'axios';

export default async (req, res) => {
  const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

  try {
    const slackResponse = await axios.post(SLACK_WEBHOOK_URL, {
      text: req.body.text
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending to Slack:', error);
    return res.status(500).json({ error: 'Failed to send message to Slack.' });
  }
};
