import React from "react";
import { ChakraProvider, Box } from "@chakra-ui/react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import theme from "@/theme";
import HomePage from "@/pages/HomePage";
import CaseStudies from "@/pages/CaseStudies";
import DataExplorer from "@/pages/DataExplorer";
import ReportImpact from "@/pages/ReportImpact";
import Learn from "@/pages/Learn";
import About from "@/pages/About";
import CaseDetail from "@/pages/CaseDetail";
import "@/i18n";
import NavBar from "@/components/NavBar";

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <NavBar />
        <Box as="main" w="100%">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/cases" element={<CaseStudies />} />
            <Route path="/cases/:id" element={<CaseDetail />} />
            <Route path="/explore" element={<DataExplorer />} />
            <Route path="/report" element={<ReportImpact />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </Box>
      </Router>
    </ChakraProvider>
  );
}

export default App;
