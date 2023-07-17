import React, { useRef, useState } from 'react';

import { SearchTerm } from "../../api/Search";
import { SearchEntry, SearchLocation, Section } from "./Types";
import { Box, IconButton, Stack } from "@mui/material";
import Bubble from "./Bubble";
import { Add } from "@mui/icons-material";

const SearchBar = ({
  config,
  search,
  setSearch,
}: {
  config: SearchEntry[];
  search: SearchTerm[];
  setSearch: (search: SearchTerm[]) => void;
}) => {
  const searchRef = useRef<HTMLDivElement>(null);
  const [ location, setLocation ] = useState<SearchLocation>({
    bubble: 0,
    section: Section.Field,
  });

  const onChange = (term: SearchTerm) => {
    setSearch(search.map((t, idx) => (idx === location.bubble ? term : t)));
    setLocation({
      bubble: location.bubble,
      section: (location.section + 1) as Section,
    });
  };

  return (
    <Stack
      width={'100%'}
      flexWrap={"wrap"}
      style={{ border: '1px solid black' }}
      direction={"row"}
      spacing={"1em"}
      padding={"0.5em"}
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
          onChange={onChange}
        />
      ))}
      <Box>
        <IconButton onClick={() => setSearch(search.concat([ {} ]))}><Add/></IconButton>
      </Box>
    </Stack>
  );
};
export default SearchBar;
