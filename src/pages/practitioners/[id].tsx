import { GetServerSideProps } from 'next';
import { Container, Box } from '@chakra-ui/react';
import { PractitionerProfile } from '../../components/Practitioners/PractitionerProfile';
import { PractitionerService } from '../../services/practitioner.service';
import { useRouter } from 'next/router';

interface PractitionerPageProps {
  practitioner: {
    id: string;
    user: {
      name: string;
      image: string;
      email: string;
    };
    specialization: string[];
    experience: number;
    bio?: string;
    rating?: number;
    certifications: string[];
    education: string[];
    languages: string[];
    services: Array<{
      id: string;
      name: string;
      description?: string;
      duration: number;
      price: number;
    }>;
    portfolio: Array<{
      id: string;
      title: string;
      description?: string;
      imageUrl: string;
      beforeImage?: string;
      afterImage?: string;
      category: string;
      tags: string[];
    }>;
  };
}

export default function PractitionerPage({ practitioner }: PractitionerPageProps) {
  const router = useRouter();

  const handleBookService = (serviceId: string) => {
    router.push(`/booking?practitionerId=${practitioner.id}&serviceId=${serviceId}`);
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Box>
        <PractitionerProfile {...practitioner} onBookService={handleBookService} />
      </Box>
    </Container>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  if (!params?.id || typeof params.id !== 'string') {
    return {
      notFound: true,
    };
  }

  const practitionerService = new PractitionerService();

  try {
    const practitioner = await practitionerService.getPractitionerById(params.id);

    if (!practitioner) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        practitioner,
      },
    };
  } catch (error) {
    console.error('Error fetching practitioner:', error);
    return {
      notFound: true,
    };
  }
}; 