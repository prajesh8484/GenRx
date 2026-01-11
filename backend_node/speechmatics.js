import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const SPEECHMATICS_API_URL = 'https://asr.api.speechmatics.com/v2';

export class SpeechmaticsClient {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    async transcribe(filePath) {
        try {
            // 1. Upload the file
            const formData = new FormData();
            formData.append('data_file', fs.createReadStream(filePath));
            formData.append('config', JSON.stringify({
                type: 'transcription',
                transcription_config: {
                    language: 'en', // Default to English, can be parameterized
                    operating_point: 'enhanced' // Use 'standard' or 'enhanced'
                }
            }));

            const uploadResponse = await axios.post(`${SPEECHMATICS_API_URL}/jobs`, formData, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    ...formData.getHeaders()
                }
            });

            const jobId = uploadResponse.data.id;
            console.log(`Job created with ID: ${jobId}`);

            // 2. Poll for results
            return await this.pollForResults(jobId);

        } catch (error) {
            console.error('Error in Speechmatics transcription:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    async pollForResults(jobId) {
        const checkStatus = async () => {
            const response = await axios.get(`${SPEECHMATICS_API_URL}/jobs/${jobId}`, {
                headers: { 'Authorization': `Bearer ${this.apiKey}` }
            });
            return response.data;
        };

        return new Promise((resolve, reject) => {
            const interval = setInterval(async () => {
                try {
                    const status = await checkStatus();
                    console.log(`Job ${jobId} status: ${status.job.status}`);

                    if (status.job.status === 'running') {
                        // Still processing, continue waiting
                    } else if (status.job.status === 'done') {
                        clearInterval(interval);
                        // Fetch the transcript
                        const transcriptResponse = await axios.get(`${SPEECHMATICS_API_URL}/jobs/${jobId}/transcript?format=txt`, {
                            headers: { 'Authorization': `Bearer ${this.apiKey}` }
                        });
                        resolve(transcriptResponse.data);
                    } else if (status.job.status === 'rejected' || status.job.status === 'expired') {
                        clearInterval(interval);
                        reject(new Error(`Job failed with status: ${status.job.status}`));
                    }
                } catch (error) {
                    clearInterval(interval);
                    reject(error);
                }
            }, 1000); // Poll every 1 second
        });
    }
}
