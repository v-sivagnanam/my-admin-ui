import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faEdit, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import '../styles/Table.css';

class Table extends Component {
    constructor(props) {
        super(props);
        this.state = {
            users: [],
            currentPage: 1,
            searchTerm: '',
            selectedUsers: [],
            editingUserId: null,
            editedUserInfo: {}
        };
        this.pageSize = 10;
    }

    componentDidMount() {
        this.getUsers();
    }

    getUsers = () => {
        fetch('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json')
            .then(response => response.json())
            .then(data => this.setState({ users: data }))
            .catch(error => console.error('Error fetching users:', error));
    };

    handleSearch = (event) => {
        this.setState({ searchTerm: event.target.value, currentPage: 1 });
    };

    handlePageChange = (page) => {
        this.setState({ currentPage: page });
    };

    toggleSelectAll = () => {
        const { selectedUsers, users, currentPage } = this.state;
        const startIndex = (currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const paginatedUsers = users.slice(startIndex, endIndex);
        if (selectedUsers.length === paginatedUsers.length) {
            this.setState({ selectedUsers: [] });
        } else {
            this.setState({ selectedUsers: paginatedUsers.map(user => user.id) });
        }
    };

    toggleSelectOne = (userId) => {
        const { selectedUsers } = this.state;
        if (selectedUsers.includes(userId)) {
            this.setState({ selectedUsers: selectedUsers.filter(id => id !== userId) });
        } else {
            this.setState({ selectedUsers: [...selectedUsers, userId] });
        }
    };

    startEditingUser = (userId) => {
        const userToEdit = this.state.users.find(user => user.id === userId);
        this.setState({ editingUserId: userId, editedUserInfo: { ...userToEdit } });
    };

    handleEditChange = (event) => {
        const { name, value } = event.target;
        this.setState(prevState => ({
            editedUserInfo: {
                ...prevState.editedUserInfo,
                [name]: value
            }
        }));
    };

    saveEditedUser = () => {
        const { users, editedUserInfo } = this.state;
        const updatedUsers = users.map(user => {
            if (user.id === editedUserInfo.id) {
                return { ...user, ...editedUserInfo };
            }
            return user;
        });
        this.setState({ users: updatedUsers, editingUserId: null, editedUserInfo: {} });
    };

    deleteUser = (userId) => {
        const updatedUsers = this.state.users.filter(user => user.id !== userId);
        this.setState({ users: updatedUsers });
    };

    deleteSelected = () => {
        const { users, selectedUsers } = this.state;
        const updatedUsers = users.filter(user => !selectedUsers.includes(user.id));
        this.setState({ users: updatedUsers, selectedUsers: [] });
      };

      render() {
        const { users, currentPage, searchTerm, selectedUsers, editingUserId, editedUserInfo } = this.state;
        const startIndex = (currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        const filteredUsers = users.filter(user =>
          user.id.toString().includes(searchTerm) ||
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.role.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
      
        return (
          <div className="container">
            <h1>User Management Interface</h1>
            <div className="search-container">
              <input type="text" placeholder="Search..." value={searchTerm} onChange={this.handleSearch} />
              <button className="search-icon" onClick={() => this.handleSearch(searchTerm)}>Search</button>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th><input type="checkbox" onChange={this.toggleSelectAll} checked={selectedUsers.length === paginatedUsers.length} /></th>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="no-data">No data found</td>
                    </tr>
                  ) : (
                    paginatedUsers.map(user => (
                      <tr key={user.id} className={selectedUsers.includes(user.id) ? 'selected' : ''}>
                        <td><input type="checkbox" onChange={() => this.toggleSelectOne(user.id)} checked={selectedUsers.includes(user.id)} /></td>
                        <td>{user.id}</td>
                        <td>{editingUserId === user.id ? <input type="text" name="name" value={editedUserInfo.name} onChange={this.handleEditChange} /> : user.name}</td>
                        <td>{editingUserId === user.id ? <input type="text" name="email" value={editedUserInfo.email} onChange={this.handleEditChange} /> : user.email}</td>
                        <td>{editingUserId === user.id ? <input type="text" name="role" value={editedUserInfo.role} onChange={this.handleEditChange} /> : user.role}</td>
                        <td>
                          {editingUserId === user.id ? (
                            <div className="action-buttons">
                              <button onClick={() => this.saveEditedUser()} className="action-button">
                                <FontAwesomeIcon icon={faSave} /> Save
                              </button>
                              <button onClick={() => this.setState({ editingUserId: null, editedUserInfo: {} })} className="action-button">
                                <FontAwesomeIcon icon={faTimes} /> Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="action-buttons">
                              <button onClick={() => this.startEditingUser(user.id)} className="action-button">
                                <FontAwesomeIcon icon={faEdit} /> Edit
                              </button>
                              <button onClick={() => this.deleteUser(user.id)} className="action-button">
                                <FontAwesomeIcon icon={faTrashAlt} /> Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="pagination">
              <button onClick={() => this.handlePageChange(1)}>First</button>
              <button onClick={() => this.handlePageChange(Math.max(1, currentPage - 1))}>Previous</button>
              {Array.from({ length: Math.ceil(filteredUsers.length / this.pageSize) }, (_, index) => (
                <button key={index + 1} onClick={() => this.handlePageChange(index + 1)}>{index + 1}</button>
              ))}
              <button onClick={() => this.handlePageChange(Math.min(Math.ceil(filteredUsers.length / this.pageSize), currentPage + 1))}>Next</button>
              <button onClick={() => this.handlePageChange(Math.ceil(filteredUsers.length / this.pageSize))}>Last</button>
            </div>
            <button onClick={this.deleteSelected} className="delete-selected">Delete Selected</button>
          </div>
        );
      }
      
}

export default Table;
