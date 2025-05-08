let students = JSON.parse(localStorage.getItem("students")) || [];
let role = "teacher";  // Default to teacher role

// Function to render the student table
function renderTable() {
  const table = document.getElementById("student-table");
  table.innerHTML = "";

  let filteredStudents = students;

  // Search functionality
  const searchText = document.getElementById("search").value.toLowerCase();
  if (searchText) {
    filteredStudents = students.filter(student =>
      student.name.toLowerCase().includes(searchText) ||
      student.roll.toLowerCase().includes(searchText)
    );
  }

  filteredStudents.forEach((student, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${student.name}</td>
      <td>${student.roll}</td>
      <td>${student.grade}</td>
      <td>
        <input type="checkbox" onchange="toggleAttendance(${index})" ${student.attendance ? "checked" : ""}>
        ${student.attendance ? "Present" : "Absent"}
      </td>
      <td>
        <input type="text" value="${student.comment}" onchange="updateComment(${index}, this.value)" placeholder="Add a comment...">
      </td>
      <td>
        <button onclick="editStudent(${index})">Edit</button>
        <button onclick="deleteStudent(${index})">Delete</button>
      </td>
    `;

    table.appendChild(row);
  });

  // Update dashboard statistics
  updateDashboard();
}

// Update Dashboard Statistics
function updateDashboard() {
  const totalStudents = students.length;
  const presentStudents = students.filter(student => student.attendance).length;
  document.getElementById("total-students").textContent = totalStudents;
  document.getElementById("present-students").textContent = presentStudents;
}

// Toggle attendance (Present / Absent)
function toggleAttendance(index) {
  students[index].attendance = !students[index].attendance;
  saveToLocalStorage();
  renderTable();
}

// Update comment
function updateComment(index, value) {
  students[index].comment = value;
  saveToLocalStorage();
  renderTable();
}

// Edit student details
function editStudent(index) {
  const student = students[index];
  document.getElementById("name").value = student.name;
  document.getElementById("roll").value = student.roll;
  document.getElementById("grade").value = student.grade;

  // Replace the submit button with an update button
  const form = document.getElementById("student-form");
  const button = form.querySelector("button");
  button.textContent = "Update Student";
  button.onclick = () => updateStudent(index);
}

// Update student details
function updateStudent(index) {
  const name = document.getElementById("name").value;
  const roll = document.getElementById("roll").value;
  const grade = document.getElementById("grade").value;

  students[index] = { ...students[index], name, roll, grade };
  saveToLocalStorage();
  renderTable();

  // Reset form and button
  const form = document.getElementById("student-form");
  form.reset();
  const button = form.querySelector("button");
  button.textContent = "Add Student";
  button.onclick = addStudent;
}

// Add new student
function addStudent(e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const roll = document.getElementById("roll").value;
  const grade = document.getElementById("grade").value;

  const student = {
    name,
    roll,
    grade,
    attendance: false,
    comment: ""
  };

  students.push(student);
  saveToLocalStorage();
  renderTable();

  // Reset form
  document.getElementById("student-form").reset();
}

// Delete student
function deleteStudent(index) {
  students.splice(index, 1);
  saveToLocalStorage();
  renderTable();
}

// Save students data to localStorage
function saveToLocalStorage() {
  localStorage.setItem("students", JSON.stringify(students));
}

// Export students data to CSV
document.getElementById("export").addEventListener("click", () => {
  let csvContent = "Name, Roll No, Grade, Attendance, Comment\n";
  students.forEach(student => {
    const attendance = student.attendance ? "Present" : "Absent";
    csvContent += `${student.name}, ${student.roll}, ${student.grade}, ${attendance}, ${student.comment}\n`;
  });

  const encodedUri = encodeURI(`data:text/csv;charset=utf-8,${csvContent}`);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "students.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// Sort table columns
let currentSort = { column: "", order: "asc" };

function sortTable(column) {
  const sortedStudents = [...students];
  
  if (column === currentSort.column) {
    currentSort.order = currentSort.order === "asc" ? "desc" : "asc";
  } else {
    currentSort.column = column;
    currentSort.order = "asc";
  }

  sortedStudents.sort((a, b) => {
    const valueA = a[column].toString().toLowerCase();
    const valueB = b[column].toString().toLowerCase();

    if (currentSort.order === "asc") {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });

  students = sortedStudents;
  saveToLocalStorage();
  renderTable();
}

// Initialize data on page load
document.addEventListener("DOMContentLoaded", () => {
  renderTable();

  // Set up role-based UI
  document.getElementById("role").addEventListener("change", (e) => {
    role = e.target.value;
    if (role === "student") {
      // Hide some actions for students (e.g., editing or deleting)
      document.querySelectorAll("button").forEach(button => {
        if (button.textContent === "Edit" || button.textContent === "Delete") {
          button.disabled = true;
        }
      });
    }
  });
});

// Add event listener for form submission
document.getElementById("student-form").addEventListener("submit", addStudent);
