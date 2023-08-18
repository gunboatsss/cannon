import { externalLinks } from '@/constants/externalLinks';
import { Flex, Link } from '@chakra-ui/react';
import { GitHub } from 'react-feather';

export const GithubFooter = () => {
  return (
    <Flex
      borderTop="1px solid"
      borderColor="gray.700"
      alignItems="center"
      justifyContent="center"
      gap={2}
      py={2}
      px={4}
      backgroundColor="black"
    >
      <GitHub size={16} />
      <Link href={externalLinks.GITHUB_CANNON} fontSize="sm">
        Cannon on GitHub
      </Link>
    </Flex>
  );
};