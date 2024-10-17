import React, { useRef, useState } from 'react';

import { SearchTerm } from "../../api/Search";
import { SearchEntry, SearchLocation, Section } from "./Types";
import { Box, IconButton, Stack } from "@mui/material";
import Bubble from "./Bubble";
import { Add, Refresh } from "@mui/icons-material";
import Loader from "../../atoms/Loader";

const SearchBar = ({
  config,
  search,
  setSearch,
  refresh,
  loading = false
}: {
  config: SearchEntry[];
  search: SearchTerm[];
  setSearch: (search: SearchTerm[]) => void;
  refresh?: () => void;
  loading?: boolean;
}) => {
  const searchRef = useRef<HTMLDivElement>(null);
  const [ location, setLocation ] = useState<SearchLocation>({
    bubble: 0,
    section: Section.Field,
  });

  const onChange = (idx: number, term: SearchTerm) => {
    setSearch(search.map((t, i) => (i === idx ? term : t)));
    setLocation({
      bubble: location.bubble,
      section: (location.section + 1) as Section,
    });
  };

  return (
    <Stack
      width={'100%'}
      style={{ border: '1px solid black' }}
      direction={"row"}
      spacing={"1em"}
      padding={"0.5em"}
      alignItems={"center"}
      justifyContent={"space-between"}
    >
      <Stack
        flexWrap={"wrap"}
        direction={"row"}
        spacing={"1em"}

        ref={searchRef}
        // onClick={activate}
        borderRadius={1}
        alignItems={"center"}
      >
        {search.map((term, idx) => (
          <Bubble
            key={`term-${idx}`}
            config={config}
            index={idx}
            search={search}
            setSearch={setSearch}
            term={term}
            onChange={(t) => onChange(idx, t)}
          />
        ))}
        <Box>
          <IconButton onClick={() => setSearch(search.concat([ {} ]))}><Add/></IconButton>
        </Box>
      </Stack>
      {!!refresh && <Box>
        <IconButton onClick={refresh} disabled={loading}>{loading ? <Loader/> : <Refresh/>}</IconButton>
      </Box>}
    </Stack>
  );
};
export default SearchBar;
