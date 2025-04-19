import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

// Initialize Lambda client
const lambdaClient = new LambdaClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

/**
 * Invoke a Lambda function
 */
export const invokeLambda = async <T, R>({
  functionName,
  payload,
  invocationType = 'RequestResponse', // 'RequestResponse' (synchronous) or 'Event' (asynchronous)
}: {
  functionName: string;
  payload: T;
  invocationType?: 'RequestResponse' | 'Event';
}): Promise<R> => {
  try {
    // Convert the JavaScript object to a JSON string and then to a Uint8Array
    const payloadBytes = new TextEncoder().encode(JSON.stringify(payload));

    const command = new InvokeCommand({
      FunctionName: functionName,
      Payload: payloadBytes,
      InvocationType: invocationType,
    });

    const response = await lambdaClient.send(command);

    if (response.FunctionError) {
      throw new Error(`Lambda execution error: ${response.FunctionError}`);
    }

    if (invocationType === 'Event') {
      // For asynchronous invocations, we don't get a meaningful payload
      return {} as R;
    }

    // Parse the response payload
    if (response.Payload) {
      const responseJson = new TextDecoder().decode(response.Payload);
      return JSON.parse(responseJson) as R;
    }

    throw new Error('No response payload received from Lambda');
  } catch (error) {
    console.error('Error invoking Lambda function:', error);
    throw error;
  }
};

/**
 * Invoke a Lambda function asynchronously (Fire and forget)
 */
export const invokeLambdaAsync = async <T>({
  functionName,
  payload,
}: {
  functionName: string;
  payload: T;
}): Promise<void> => {
  await invokeLambda({
    functionName,
    payload,
    invocationType: 'Event',
  });
};

export default lambdaClient; 