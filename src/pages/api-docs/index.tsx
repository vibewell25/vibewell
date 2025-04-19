import { useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import SwaggerUI from 'swagger-ui-react';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import 'swagger-ui-react/swagger-ui.css';

export default function ApiDocs() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Client-side authentication check
    const checkAuth = async () => {
      const session = await getSession();
      if (!session || session.user.role !== 'admin') {
        router.push('/auth/login');
      } else {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="api-docs-container">
      <SwaggerUI
        url="/api/swagger.json"
        docExpansion="list"
        supportedSubmitMethods={['get', 'post', 'put', 'delete']}
        persistAuthorization={true}
      />
      <style jsx global>{`
        .swagger-ui .info .title small.version-stamp {
          display: none;
        }
        .swagger-ui .auth-wrapper {
          justify-content: flex-end;
        }
      `}</style>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  // Server-side authentication check
  const session = await getSession(context);
  
  if (!session || session.user.role !== 'admin') {
    return {
      redirect: {
        destination: '/auth/login',
        permanent: false,
      },
    };
  }

  // Only allow access in development environments
  const environment = process.env.NODE_ENV || 'development';
  if (!['development', 'staging'].includes(environment)) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}; 