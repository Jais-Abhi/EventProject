package com.company.event.user;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User insertUser(UserRequest userRequest) {
        User user = new User();
        user.setEmail(userRequest.getEmail());
        user.setFirstName(userRequest.getFirstName());
        user.setLastName(userRequest.getLastName());
        user.setPassword(userRequest.getPassword());
        user.setBranch(userRequest.getBranch());
        user.setCourse(userRequest.getCourse());
        user.setFatherName(userRequest.getFatherName());
        user.setUsername(userRequest.getUsername());
        try {
            return userRepository.save(user);
        } catch (Exception e) {
            throw new IllegalStateException("Could not save user", e);
        }
    }

    public UserResponse getUserById(String id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return null;
        }
        UserResponse userResponse = new UserResponse();
        userResponse.setEmail(user.getEmail());
        userResponse.setFirstName(user.getFirstName());
        userResponse.setLastName(user.getLastName());
        userResponse.setPassword(user.getPassword());
        userResponse.setBranch(user.getBranch());
        userResponse.setCourse(user.getCourse());
        userResponse.setFatherName(user.getFatherName());
        userResponse.setUsername(user.getUsername());
        userResponse.setId(user.getId());
        userResponse.setRole(user.getRole());
        return userResponse;
    }

    public List<UserResponse> getAllUsers(){
        List<User> users = userRepository.findAll();
        List<UserResponse> userResponseList = new ArrayList<>();
        for (User user : users) {
            UserResponse userResponse = new UserResponse();
            userResponse.setEmail(user.getEmail());
            userResponse.setFirstName(user.getFirstName());
            userResponse.setLastName(user.getLastName());
            userResponse.setPassword(user.getPassword());
            userResponse.setBranch(user.getBranch());
            userResponse.setCourse(user.getCourse());
            userResponse.setFatherName(user.getFatherName());
            userResponse.setUsername(user.getUsername());
            userResponse.setId(user.getId());
            userResponse.setRole(user.getRole());
            userResponseList.add(userResponse);
        }
        return userResponseList;
    }

    public boolean deleteUserById(String id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return false;
        }
        userRepository.deleteById(id);
        return true;
    }

    public UserResponse updateUser(UserRequest userRequest, String id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return null;
        }
        user.setEmail(userRequest.getEmail());
        user.setFirstName(userRequest.getFirstName());
        user.setLastName(userRequest.getLastName());
        user.setPassword(userRequest.getPassword());
        user.setBranch(userRequest.getBranch());
        user.setCourse(userRequest.getCourse());
        user.setFatherName(userRequest.getFatherName());
        user.setUsername(userRequest.getUsername());
        userRepository.save(user);
        UserResponse userResponse = new UserResponse();
        userResponse.setEmail(user.getEmail());
        userResponse.setFirstName(user.getFirstName());
        userResponse.setLastName(user.getLastName());
        userResponse.setPassword(user.getPassword());
        userResponse.setBranch(user.getBranch());
        userResponse.setCourse(user.getCourse());
        userResponse.setFatherName(user.getFatherName());
        userResponse.setUsername(user.getUsername());
        userResponse.setId(user.getId());
        userResponse.setRole(user.getRole());
        return userResponse;
    }
}
