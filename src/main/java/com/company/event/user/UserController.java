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

    @PostMapping
    public ResponseEntity<?> insertUser(@Valid @RequestBody UserRequest userRequest) {
        User user =  userService.insertUser(userRequest);
        if(user==null){
            return new ResponseEntity<>("User not created",HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>("User Created", HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable String id){
        UserResponse userResponse = userService.getUserById(id);
        if(userResponse==null){
            return new ResponseEntity<>("User not found",HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(userResponse, HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<?> getAllUsers(){
        return new ResponseEntity<>(userService.getAllUsers(), HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUserById(@PathVariable String id){
        boolean result = userService.deleteUserById(id);
        if(result){
            return new ResponseEntity<>("User deleted",HttpStatus.OK);
        }
        return new ResponseEntity<>("User not found",HttpStatus.BAD_REQUEST);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser( @PathVariable String id,@Valid @RequestBody UserRequest userRequest){
        UserResponse userResponse = userService.updateUser(userRequest,id);
        if(userResponse==null){
            return new ResponseEntity<>("User not found",HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(userResponse, HttpStatus.OK);
    }
}
