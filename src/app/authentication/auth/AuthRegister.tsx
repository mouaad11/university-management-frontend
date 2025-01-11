import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiService } from '../../../services/api';

import {
  Box,
  Typography,
  Button,
  Stack,
  Snackbar,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import Link from "next/link";
import CustomTextField from "@/app/(DashboardLayout)/components/forms/theme-elements/CustomTextField";
import type { Classe } from '../../../types';

interface registerType {
  title?: string;
  subtitle?: JSX.Element | JSX.Element[];
  subtext?: JSX.Element | JSX.Element[];
}

const AuthRegister = ({ title, subtitle, subtext }: registerType) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("ROLE_STUDENT"); // Default role
  const [studentId, setStudentId] = useState("");
  const [classId, setClassId] = useState("");
  const [department, setDepartment] = useState("");
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const router = useRouter();
  const [classes, setClasses] = useState<Classe[]>([]); // State to store fetched classes


  // Fetch classes when the component mounts
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await apiService.getAllClasses();
        
        // Assuming apiService uses Axios:
        setClasses(response.data); // Use the data directly from the Axios response
  
      } catch (err) {
        console.error("Error fetching classes:", err);
      }
    };
  
    fetchClasses();
  }, []);  

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      const response = await fetch("http://localhost:8080/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
          firstName,
          lastName,
          role,
          studentId: role === "ROLE_STUDENT" ? studentId : undefined,
          classId: role === "ROLE_STUDENT" ? classId : undefined,
          department: role === "ROLE_PROFESSOR" ? department : undefined,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Échec de l'inscription");
      }
  
      // Registration successful
setError("Inscription réussie! Veuillez attendre la confirmation de l'administrateur.");
setOpenSnackbar(true);

// Delay the redirection to allow the snackbar to display
setTimeout(() => {
  localStorage.setItem('registrationSuccessMessage', 'Inscription réussie! Veuillez attendre la confirmation de l\'administrateur.');
  router.push("/authentication/login"); // Redirect to login page
}, 3000); // Adjust delay as needed

    } catch (err) {
      // Safely handle the error
      if (err instanceof Error) {
        setError(err.message); // Access the message property safely
      } else {
        setError("Une erreur inconnue s'est produite"); // Fallback for unknown errors
      }
      setOpenSnackbar(true);
    }
  };

  return (
    <>
      {title ? (
        <Typography fontWeight="700" variant="h2" mb={1}>
          {title}
        </Typography>
      ) : null}

      {subtext}

      <form onSubmit={handleRegister}>
        <Box>
          <Stack mb={3}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              component="label"
              htmlFor="username"
              mb="5px"
            >
              Nom d'utilisateur
            </Typography>
            <CustomTextField
              id="username"
              variant="outlined"
              fullWidth
              value={username}
              onChange={(e: any) => setUsername(e.target.value)}
              required
            />

            <Typography
              variant="subtitle1"
              fontWeight={600}
              component="label"
              htmlFor="email"
              mb="5px"
              mt="25px"
            >
              Adresse Email
            </Typography>
            <CustomTextField
              id="email"
              variant="outlined"
              fullWidth
              value={email}
              onChange={(e: any) => setEmail(e.target.value)}
              required
            />

            <Typography
              variant="subtitle1"
              fontWeight={600}
              component="label"
              htmlFor="password"
              mb="5px"
              mt="25px"
            >
              Mot de passe
            </Typography>
            <CustomTextField
              id="password"
              type="password"
              variant="outlined"
              fullWidth
              value={password}
              onChange={(e: any) => setPassword(e.target.value)}
              required
            />

            <Typography
              variant="subtitle1"
              fontWeight={600}
              component="label"
              htmlFor="firstName"
              mb="5px"
              mt="25px"
            >
              Prénom
            </Typography>
            <CustomTextField
              id="firstName"
              variant="outlined"
              fullWidth
              value={firstName}
              onChange={(e: any) => setFirstName(e.target.value)}
              required
            />

            <Typography
              variant="subtitle1"
              fontWeight={600}
              component="label"
              htmlFor="lastName"
              mb="5px"
              mt="25px"
            >
              Nom de famille
            </Typography>
            <CustomTextField
              id="lastName"
              variant="outlined"
              fullWidth
              value={lastName}
              onChange={(e: any) => setLastName(e.target.value)}
              required
            />

            <Typography
              variant="subtitle1"
              fontWeight={600}
              component="label"
              htmlFor="role"
              mb="5px"
              mt="25px"
            >
              Rôle
            </Typography>
            <FormControl fullWidth variant="outlined">
              <Select
                id="role"
                value={role}
                onChange={(e: any) => setRole(e.target.value)}
                required
              >
                <MenuItem value="ROLE_STUDENT">Étudiant</MenuItem>
                <MenuItem value="ROLE_PROFESSOR">Professeur</MenuItem>
                <MenuItem value="ROLE_ADMIN">Administrateur</MenuItem>
              </Select>
            </FormControl>

            {role === "ROLE_STUDENT" && (
              <>
                <Typography
                  variant="subtitle1"
                  fontWeight={600}
                  component="label"
                  htmlFor="studentId"
                  mb="5px"
                  mt="25px"
                >
                  ID Étudiant
                </Typography>
                <CustomTextField
                  id="studentId"
                  variant="outlined"
                  fullWidth
                  value={studentId}
                  onChange={(e: any) => setStudentId(e.target.value)}
                  required
                />

<Typography
                  variant="subtitle1"
                  fontWeight={600}
                  component="label"
                  htmlFor="classId"
                  mb="5px"
                  mt="25px"
                >
                  Classe
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>Classe</InputLabel>
                  <Select
                    id="classId"
                    value={classId}
                    label="Classe"
                    onChange={(e) => setClassId(e.target.value)} // Update classId state
                    required
                  >
                    {classes.map((classe) => (
                      <MenuItem key={classe.id} value={classe.id}>
                        {classe.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}

            {role === "ROLE_PROFESSOR" && (
              <>
                <Typography
                  variant="subtitle1"
                  fontWeight={600}
                  component="label"
                  htmlFor="department"
                  mb="5px"
                  mt="25px"
                >
                  Département
                </Typography>
                <CustomTextField
                  id="department"
                  variant="outlined"
                  fullWidth
                  value={department}
                  onChange={(e: any) => setDepartment(e.target.value)}
                  required
                />
              </>
            )}
          </Stack>
          <Button
            color="primary"
            variant="contained"
            size="large"
            fullWidth
            type="submit"
          >
            S'inscrire
          </Button>
        </Box>
      </form>

      {subtitle}

      <Snackbar
  open={openSnackbar}
  autoHideDuration={6000}
  onClose={() => setOpenSnackbar(false)}
>
  <Alert severity={error.includes("réussie") ? "success" : "error"} onClose={() => setOpenSnackbar(false)}>
    {error}
  </Alert>
</Snackbar>
    </>
  );
};

export default AuthRegister;