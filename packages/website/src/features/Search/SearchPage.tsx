'use client';

import { useEffect, useState } from 'react';
import {
  Grid,
  GridItem,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { useQuery } from '@apollo/client';
import { GET_PACKAGES, TOTAL_PACKAGES } from '@/graphql/queries';
import {
  GetPackagesQuery,
  GetPackagesQueryVariables,
  GetTotalPackagesQuery,
  GetTotalPackagesQueryVariables,
} from '@/types/graphql/graphql';
import { PackagePreview } from '@/features/Search/PackagePreview';
import { scale } from '@chakra-ui/tooltip/dist/tooltip.transition';
import { Search } from 'react-feather';

export const SearchPage = () => {
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const pageSize = 5;
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { loading, error, data } = useQuery<
    GetPackagesQuery,
    GetPackagesQueryVariables
  >(GET_PACKAGES, {
    variables: {
      query: searchTerm,
      skip: pageSize * (page - 1),
      first: pageSize,
    },
  });
  const { data: totalPackages } = useQuery<
    GetTotalPackagesQuery,
    GetTotalPackagesQueryVariables
  >(TOTAL_PACKAGES, {
    variables: { query: searchTerm },
  });

  const [packages, setPackages] = useState<GetPackagesQuery['packages']>([]);

  const handleSearch = (e: any) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (loading) {
      console.log('loading:', loading);
    }
    if (data) {
      console.log('data:', JSON.stringify(data.packages.length));
    }
    if (error) {
      console.log('error:', error);
    }
    setPackages(data?.packages || []);
  }, [loading, error, data]);

  useEffect(() => {
    console.log('totalPackages:', totalPackages?.totalPackages?.length);
    setTotalPages(
      Math.ceil((totalPackages?.totalPackages?.length || 0) / pageSize)
    );
  }, [totalPackages]);

  return (
    <Grid
      template-columns="repeat(12, 1fr)"
      gap="6"
      py="10"
      maxWidth="containers.lg"
      mx="auto"
      px="4"
      // spacing="40px" TODO: not found equivalent in react
    >
      <GridItem colSpan={[12, 3]}>
        <Heading
          as="h3"
          size="sm"
          textTransform="uppercase"
          fontWeight="normal"
          letterSpacing="1px"
          mb="2"
        >
          Search
        </Heading>
        <InputGroup>
          <InputLeftElement>
            <Search
              style={{
                transform: 'scale(0.8)',
                transformOrigin: 'center left',
                opacity: 0.66,
              }}

              // v-html="$feathericons['search'].toSvg()"
            />
          </InputLeftElement>
          <Input
            background="transparent"
            size="sm"
            borderColor="gray.500"
            mb="6"
            onChange={handleSearch}
          />
        </InputGroup>
        <div>
          Showing page {page} of {totalPages}
        </div>
        <div>
          <button onClick={() => setPage(page - 1)} disabled={page === 1}>
            Previous
          </button>
        </div>
        <div>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>
      </GridItem>
      <GridItem>
        <PackagePreview packages={packages} />
      </GridItem>
    </Grid>
  );
};
