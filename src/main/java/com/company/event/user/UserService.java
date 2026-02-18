package com.company.event.user;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final org.springframework.data.mongodb.core.MongoTemplate mongoTemplate;

    public User insertUser(UserRequest userRequest) {
        User user = new User();
        user.setEmail(userRequest.getEmail());
        user.setFirstName(userRequest.getFirstName());
        user.setLastName(userRequest.getLastName());

        user.setPassword(passwordEncoder.encode(userRequest.getPassword()));

        user.setBranch(userRequest.getBranch());
        user.setCourse(userRequest.getCourse());
        user.setFatherName(userRequest.getFatherName());
        user.setUsername(userRequest.getUsername());
        user.setRollNumber(userRequest.getRollNumber());

        if (user.getRole() == null) {
            user.setRole(Roles.USER);
        }

        try {
            return userRepository.save(user);
        } catch (Exception e) {
            throw new IllegalStateException("Could not save user", e);
        }
    }

    public UserResponse getUserById(String id) {
        return userRepository.findById(id)
                .map(this::mapToResponse)
                .orElse(null);
    }

    public List<UserResponse> getAllUsers() {

        List<User> users = userRepository.findAll();
        List<UserResponse> userResponseList = new ArrayList<>();

        for (User user : users) {
            userResponseList.add(mapToResponse(user));
        }

        return userResponseList;
    }

    public boolean deleteUserById(String id) {

        if (!userRepository.existsById(id)) {
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

        if (userRequest.getPassword() != null &&
                !userRequest.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        }

        user.setBranch(userRequest.getBranch());
        user.setCourse(userRequest.getCourse());
        user.setFatherName(userRequest.getFatherName());
        user.setUsername(userRequest.getUsername());
        user.setRollNumber(userRequest.getRollNumber());

        userRepository.save(user);

        return mapToResponse(user);
    }

    private UserResponse mapToResponse(User user) {

        UserResponse userResponse = new UserResponse();
        userResponse.setEmail(user.getEmail());
        userResponse.setFirstName(user.getFirstName());
        userResponse.setLastName(user.getLastName());
        userResponse.setBranch(user.getBranch());
        userResponse.setCourse(user.getCourse());
        userResponse.setFatherName(user.getFatherName());
        userResponse.setUsername(user.getUsername());
        userResponse.setRollNumber(user.getRollNumber());
        userResponse.setId(user.getId());
        userResponse.setRole(user.getRole());

        return userResponse;
    }

    public List<UserResponse> searchUsers(String query) {
        org.springframework.data.mongodb.core.query.Query mongoQuery = new org.springframework.data.mongodb.core.query.Query();
        org.springframework.data.mongodb.core.query.Criteria criteria = new org.springframework.data.mongodb.core.query.Criteria().orOperator(
                org.springframework.data.mongodb.core.query.Criteria.where("username").regex(query, "i"),
                org.springframework.data.mongodb.core.query.Criteria.where("email").regex(query, "i"),
                org.springframework.data.mongodb.core.query.Criteria.where("firstName").regex(query, "i"),
                org.springframework.data.mongodb.core.query.Criteria.where("lastName").regex(query, "i"),
                org.springframework.data.mongodb.core.query.Criteria.where("rollNumber").regex(query, "i"),
                org.springframework.data.mongodb.core.query.Criteria.where("branch").regex(query, "i"),
                org.springframework.data.mongodb.core.query.Criteria.where("course").regex(query, "i")
        );
        mongoQuery.addCriteria(criteria);

        List<User> users = mongoTemplate.find(mongoQuery, User.class);
        List<UserResponse> responseList = new ArrayList<>();
        for (User user : users) {
            responseList.add(mapToResponse(user));
        }
        return responseList;
    }

    public UserResponse getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .map(this::mapToResponse)
                .orElse(null);
    }
}
