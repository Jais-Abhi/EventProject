package com.company.event.user;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.service.annotation.DeleteExchange;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserActivityService userActivityService;

    @PostMapping("/insert")
    public ResponseEntity<?> insertUser(@Valid @RequestBody UserRequest userRequest) {
        User user =  userService.insertUser(userRequest);
        if(user==null){
            return new ResponseEntity<>("User not created",HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>("User Created", HttpStatus.OK);
    }

    @GetMapping("/getById/{id}")
    public ResponseEntity<?> getUserById(@PathVariable String id){
        UserResponse userResponse = userService.getUserById(id);
        if(userResponse==null){
            return new ResponseEntity<>("User not found",HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(userResponse, HttpStatus.OK);
    }

    @GetMapping("/getAll")
    public ResponseEntity<?> getAllUsers(){
        return new ResponseEntity<>(userService.getAllUsers(), HttpStatus.OK);
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchUsers(@RequestParam String query) {
        return ResponseEntity.ok(userService.searchUsers(query));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteUserById(@PathVariable String id){
        boolean result = userService.deleteUserById(id);
        if(result){
            return new ResponseEntity<>("User deleted",HttpStatus.OK);
        }
        return new ResponseEntity<>("User not found",HttpStatus.BAD_REQUEST);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateUser( @PathVariable String id,@Valid @RequestBody UserRequest userRequest){
        UserResponse userResponse = userService.updateUser(userRequest,id);
        if(userResponse==null){
            return new ResponseEntity<>("User not found",HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(userResponse, HttpStatus.OK);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(java.security.Principal principal) {
        try {
            if (principal == null) {
                return new ResponseEntity<>("Not authenticated", HttpStatus.UNAUTHORIZED);
            }
            UserResponse userResponse = userService.getUserByUsername(principal.getName());
            if (userResponse == null) {
                return new ResponseEntity<>("User not found", HttpStatus.BAD_REQUEST);
            }
            return new ResponseEntity<>(userResponse, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/activity")
    public ResponseEntity<?> getUserActivity(java.security.Principal principal) {
        try {
            if (principal == null) {
                return new ResponseEntity<>("Not authenticated", HttpStatus.UNAUTHORIZED);
            }
            UserResponse user = userService.getUserByUsername(principal.getName());
            if (user == null) {
                return new ResponseEntity<>("User not found", HttpStatus.BAD_REQUEST);
            }
            return ResponseEntity.ok(userActivityService.getUserActivity(user.getId()));
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error fetching activity: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/activity/{userId}")
    public ResponseEntity<?> getUserActivityById(@PathVariable String userId) {
        try {
            return ResponseEntity.ok(userActivityService.getUserActivity(userId));
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error fetching activity: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
