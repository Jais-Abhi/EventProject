package com.company.event.quiz.controller;

import com.company.event.quiz.model.Event;
import com.company.event.quiz.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventRepository eventRepository;

    // CREATE EVENT
    @PostMapping("/createEvent")
    public ResponseEntity<?> createEvent(@RequestBody Event event) {

        if (event.getTitle() == null || event.getTitle().isBlank()) {
            return ResponseEntity.badRequest().body("Title is required");
        }

        if (event.getClubId() == null) {
            return ResponseEntity.badRequest().body("Club is required");
        }

        if (event.getStartTime() == null || event.getEndTime() == null) {
            return ResponseEntity.badRequest()
                    .body("Start time and end time required");
        }

        if (!event.getStartTime().isBefore(event.getEndTime())) {
            return ResponseEntity.badRequest()
                    .body("Start time must be before end time");
        }

        // Allow start time to be slightly in the past (clock skew / latency)
        Instant fiveMinutesAgo = Instant.now().minus(Duration.ofMinutes(5));
        if (event.getStartTime().isBefore(fiveMinutesAgo)) {
            return ResponseEntity.badRequest()
                    .body("Start time cannot be in the past");
        }

        event.setAttendanceProcessed(false);
        event.setDurationInMinutes((int)Duration.between(event.getStartTime(),event.getEndTime()).toMinutes());

        return ResponseEntity.ok(eventRepository.save(event));
    }

    // UPDATE EVENT
    @PutMapping("/updateEvent/{id}")
    public ResponseEntity<?> updateEvent(@PathVariable String id, @RequestBody Event eventDetails) {
        return eventRepository.findById(id)
                .map(event -> {
                    if (eventDetails.getTitle() != null) event.setTitle(eventDetails.getTitle());
                    if (eventDetails.getStartTime() != null) event.setStartTime(eventDetails.getStartTime());
                    if (eventDetails.getEndTime() != null) event.setEndTime(eventDetails.getEndTime());
                    if (eventDetails.getDurationInMinutes() != null) event.setDurationInMinutes(eventDetails.getDurationInMinutes());
                    if (eventDetails.getTotalMarks() != null) event.setTotalMarks(eventDetails.getTotalMarks());
                    if (eventDetails.getClubId() != null) event.setClubId(eventDetails.getClubId());
                    if (eventDetails.getFacultyCoordinators() != null) event.setFacultyCoordinators(eventDetails.getFacultyCoordinators());
                    if (eventDetails.getStudentCoordinators() != null) event.setStudentCoordinators(eventDetails.getStudentCoordinators());
                    
                    // Validate dates if updated
                    if (event.getStartTime() != null && event.getEndTime() != null) {
                        if (!event.getStartTime().isBefore(event.getEndTime())) {
                            return ResponseEntity.badRequest().body("Start time must be before end time");
                        }
                        event.setDurationInMinutes((int)Duration.between(event.getStartTime(),event.getEndTime()).toMinutes());
                    }

                    return ResponseEntity.ok(eventRepository.save(event));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // GET ALL EVENTS
    @GetMapping("/getAllEvent")
    public List<Event> getAllEvents() {
        List<Event> events = eventRepository.findAll();
        events.forEach(this::updateStatus);
        return events;
    }

    // GET SINGLE EVENT
    @GetMapping("/getEventById/{id}")
    public ResponseEntity<?> getEvent(@PathVariable String id) {
        return eventRepository.findById(id)
                .map(event -> {
                    updateStatus(event);
                    return ResponseEntity.ok(event);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private void updateStatus(Event event) {
        Instant now = Instant.now();
        if (event.getStartTime() == null || event.getEndTime() == null) {
            event.setStatus("UPCOMING");
            return;
        }
        if (now.isBefore(event.getStartTime())) {
            event.setStatus("UPCOMING");
        } else if (now.isAfter(event.getEndTime())) {
            event.setStatus("COMPLETED");
        } else {
            event.setStatus("LIVE");
        }
    }

    // DELETE EVENT
    @DeleteMapping("/deleteEvent/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable String id) {
        if (!eventRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        eventRepository.deleteById(id);
        return ResponseEntity.ok("Event deleted successfully");
    }
}